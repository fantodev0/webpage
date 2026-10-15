---
slug: setting-up-a-k3s-cluster
title: Setting up a k3s cluster
description: Practical notes for building a highly available k3s cluster with kube-vip.
date: 2024-06-14
draft: false
---

# Setting up a k3s cluster

`K3s` is an lightweight Kubernetes distrubution designed to be user on resouce constraint devices like IOT devices. It ships a less than 100MB single binary containing all K8s components (etcd, control plane, scheduler, etc...) and uses less than 500MB RAM when running.

# Preparation

The cluster i am setting up will consist on 3 Nodes, all being workers and masters at the same time to provide High Availability. We will also use kube-vip for High Availability as well as Load Balancing.

I setup a new subnet (**`192.168.88.0/24`**) in my network for running kubernetes and all related services.

```shellscript
Subnet 192.168.88.0/24

admin panel (used for orchestrating the cluster - where kubeclt lives): 192.168.88.2
Virtual IP for HA: 192.168.88.10
Node 1: 192.168.88.11
Node 2: 192.168.88.12
Node 3: 192.168.88.13

Load Balancing Range: 192.168.88.100 - 192.168.88.200
```

# Installing k3s on the first node

After login to the first node, run following command:

```shellscript
export K3S_TOKEN='change-this-long-random-token'
export VIP='192.168.88.10'
export NODE_IP='192.168.88.11'

curl -sfL https://get.k3s.io | K3S_TOKEN="$K3S_TOKEN" sh -s - server \
  --cluster-init \
  --tls-san "$VIP" \
  --node-ip "$NODE_IP" \
  --advertise-address "$NODE_IP" \
  --disable servicelb \
  --disable traefik \
  --write-kubeconfig-mode="644"
```

This will set some environments variables and then proceed with the installation of k3s on the node, note that **servicelb&#x20;**&#x77;ill be disable since we will use kube-vip and t**raefik as ingress controller&#x20;**&#x61;s well, since i will use traefik as `Gateway api`.

```shellscript
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
k3s kubectl get nodes
```

This set the location of the k8s config file for kubectl and then get the nodes present in the cluster.

# Installing kube-vip (node 1)

On the first node, run:

```shellscript
export INTERFACE='eth0'
export KVVERSION=$(curl -sL https://api.github.com/repos/kube-vip/kube-vip/releases | jq -r '.[0].name')
export VIP='192.168.88.10'
```

This will set 2 env variables, on containing the name of the physical (or virtual in my case) network interface, get it by using the `ip a` command. The second one fetch the latest version of kube-vip from the release source.

```shellscript
sudo curl -sNX GET https://kube-vip.io/manifests/rbac.yaml \
  -o /var/lib/rancher/k3s/server/manifests/kube-vip-rbac.yaml
```

This apply the **role based-access control** manifest of kubevip.

```shellscript
alias kube-vip="ctr --address /run/k3s/containerd/containerd.sock --namespace k8s.io run --rm --net-host ghcr.io/kube-vip/kube-vip:$KVVERSION vip /kube-vip"

ctr --address /run/k3s/containerd/containerd.sock --namespace k8s.io image pull ghcr.io/kube-vip/kube-vip:$KVVERSION

sudo mkdir -p /etc/kubernetes
cd /etc/kubernetes
sudo ln -s /etc/rancher/k3s/k3s.yaml /etc/kubernetes/admin.conf

kube-vip manifest pod \
  --interface "$INTERFACE" \
  --address "$VIP" \
  --controlplane \
  --arp \
  --leaderElection \
  | sudo tee /var/lib/rancher/k3s/agent/pod-manifests/kube-vip.yaml
```

This will create an alias (kube-vip) which pull the kube-vip image using containerd and the generate the pod manifest. The manifest will then get copied to the `pod-manifests` directory, which k3s monitors and automatically applied.

After installing, following will check if a kube-vip pod is running in the **`kube-system`** namespace and ping to see if a kube-vip is listening on the virtual ip address:

```shellscript
kubectl -n kube-system get pods
ping 192.168.88.10
```

# Join the cluster

On the Node 2, run:

```shellscript
export K3S_TOKEN='change-this-long-random-token' // the same token set before
export VIP='192.168.88.10'
export NODE_IP='192.168.88.12'
mkdir -p /var/lib/rancher/k3s/agent/pod-manifests/
scp root@192.168.88.11:/var/lib/rancher/k3s/agent/pod-manifests/kube-vip.yaml /var/lib/rancher/k3s/agent/pod-manifests/

sudo mkdir -p /etc/kubernetes
cd /etc/kubernetes
sudo ln -s /etc/rancher/k3s/k3s.yaml /etc/kubernetes/admin.conf

curl -sfL https://get.k3s.io | K3S_TOKEN="$K3S_TOKEN" sh -s - server \
  --server "https://$VIP:6443" \
  --tls-san "$VIP" \
  --node-ip "$NODE_IP" \
  --advertise-address "$NODE_IP" \
  --disable servicelb \
  --disable traefik \
  --write-kubeconfig-mode="644"
```

and on Node 3:

```shellscript
export K3S_TOKEN='change-this-long-random-token' // the same token set before
export VIP='192.168.88.10'
export NODE_IP='192.168.88.13'
mkdir -p /var/lib/rancher/k3s/agent/pod-manifests/
scp root@192.168.88.11:/var/lib/rancher/k3s/agent/pod-manifests/kube-vip.yaml /var/lib/rancher/k3s/agent/pod-manifests/


sudo mkdir -p /etc/kubernetes
cd /etc/kubernetes
sudo ln -s /etc/rancher/k3s/k3s.yaml /etc/kubernetes/admin.conf

curl -sfL https://get.k3s.io | K3S_TOKEN="$K3S_TOKEN" sh -s - server \
  --server "https://$VIP:6443" \
  --tls-san "$VIP" \
  --node-ip "$NODE_IP" \
  --advertise-address "$NODE_IP" \
  --disable servicelb \
  --disable traefik \
  --write-kubeconfig-mode="644"
```

This will set some env variables, copy the pod manifest of kube-vip from the node 1 and then save it to the created pod-manifest directory of the others node. After that the token generate when initiating the first node, will be used to make the other 2 joining the cluster as master/worker.

Then verify if they joined the cluster:

```shellscript
kubectl get nodes -o wide
```

# Adding Load Balancing Capabilities to Kube-vip

For enabling Load balancing for kube-vip we have to apply the `cloud provider manifest` for kube-vip. Login back to the node 1 and run:

```shellscript
sudo curl -sNX GET https://raw.githubusercontent.com/kube-vip/kube-vip-cloud-provider/main/manifest/kube-vip-cloud-controller.yaml \
  -o /var/lib/rancher/k3s/server/manifests/kube-vip-cloud-controller.yaml
```

This will fetch the manifest and stores it in to the `/var/lib/rancher/k3s/server/manifests/` which is also monitored by k3s and will then be applied.

For setting the load balancing range, a configmap as to be defined:

```shellscript
cat <<EOF | sudo tee /var/lib/rancher/k3s/server/manifests/kube-vip-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubevip
  namespace: kube-system
data:
  cidr-global: 192.168.88.100-192.168.88.200
EOF
```

After that the cluster will be ready for deploying workload.

# Copying the kube config to the admin machine (Optional)

Since i administrate the cluster from the admin panel (an virtual machine), i need to copy the kube config file to that machine:

```shellscript
mkdir -p ~/.kube
scp root@192.168.88.11:/etc/rancher/k3s/k3s.yaml ~/.kube/config
```

this will create the `.kube` where kubectl expects the kube config file to be, and then copy it using scp from one of the node, in this case the node 1.

After that update the local ip address from the kubeconfig use the virtual ip for communication to the cluster:

```shellscript
nano ~/.kube/config
// change
server: https://127.0.0.1:6443
// to
server: https://192.168.88.10:6443
// than save
```
