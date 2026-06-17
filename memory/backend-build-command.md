---
name: backend-build-command
description: How to build the Spring Boot backend on this corporate-proxy machine (Maven mirror + Windows truststore)
metadata:
  type: project
---

The 12 Week Year backend must be built with a specific Maven invocation on this machine. The corporate proxy blocks `.jar` downloads from Maven Central (403) and intercepts TLS.

**Working build command** (run from `backend/`):
```
"/c/Users/2389622/.m2/wrapper/dists/apache-maven-3.9.11/03d7e36a140982eea48e22c1dcac01d8862b2550b2939e09a0809bbc5182a5bc/bin/mvn" -B -Djavax.net.ssl.trustStoreType=Windows-ROOT <goals>
```

**Why:**
- `mvnw` can't bootstrap — the 9 MB Maven distribution download is reset by the proxy. A full Maven 3.9.11 is already extracted in the wrapper cache (path above); use it directly.
- `~/.m2/settings.xml` mirrors `central` → Google's mirror (`maven-central.storage-download.googleapis.com`), the only reachable host serving jars.
- `-Djavax.net.ssl.trustStoreType=Windows-ROOT` makes Java trust the corporate proxy CA (no insecure-SSL flags needed).

**How to apply:** Use this exact command for any backend Maven goal (test, package, spring-boot:run). Add `-U` only when forcing re-resolution after changing repos. See [[corporate-maven-network]] for the underlying network facts. Documented in repo at `docs/ARCHITECTURE.md`.
