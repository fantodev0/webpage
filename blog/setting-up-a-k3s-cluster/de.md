---
slug: setting-up-a-k3s-cluster
title: Einen K3s-Cluster einrichten
description: Ein praktischer Leitfaden für einen hochverfügbaren K3s-Cluster mit kube-vip.
date: 2024-06-14
draft: false
---

# Einen K3s-Cluster einrichten

K3s ist eine schlanke Kubernetes-Distribution für ressourcenbeschränkte Geräte wie IoT-Systeme. Diese Notizen zeigen einen dreiknotigen Cluster mit hoher Verfügbarkeit und kube-vip.

## Vorbereitung

Der Cluster besteht aus drei Knoten, die gleichzeitig Worker und Master sind. Ein virtuelles IP für die Hochverfügbarkeit und ein eigener Netzwerkbereich halten die Steuerung erreichbar.

```text
Subnetz: 192.168.88.0/24
Virtuelle IP: 192.168.88.10
Knoten: 192.168.88.11 – 192.168.88.13
Load-Balancing-Bereich: 192.168.88.100 – 192.168.88.200
```

## K3s auf dem ersten Knoten installieren

Nach der Anmeldung auf dem ersten Knoten werden Token und Netzwerkadresse gesetzt. Anschließend initialisiert das Installationsskript den ersten Server mit `--cluster-init` und deaktiviert die integrierten Load-Balancer.

```shell
export K3S_TOKEN='change-this-long-random-token'
export VIP='192.168.88.10'
export NODE_IP='192.168.88.11'

curl -sfL https://get.k3s.io | K3S_TOKEN="$K3S_TOKEN" sh -s - server \
  --cluster-init --tls-san "$VIP" --node-ip "$NODE_IP"
```

## Die weiteren Knoten verbinden

Die übrigen Server verwenden dasselbe Token und die virtuelle IP des Clusters. Danach bestätigt `kubectl get nodes -o wide`, dass alle Knoten verfügbar sind.

```shell
kubectl get nodes -o wide
```

## kube-vip aktivieren

kube-vip stellt die virtuelle IP und den Load-Balancing-Bereich bereit. Die offiziellen RBAC- und Cloud-Provider-Manifeste werden in den von K3s überwachten Manifest-Ordner gelegt.

```shell
kubectl -n kube-system get pods
ping 192.168.88.10
```

> Platzhalter: Ergänze hier deine eigenen Betriebsnotizen und Sicherheitsanforderungen, bevor du den Cluster produktiv verwendest.
