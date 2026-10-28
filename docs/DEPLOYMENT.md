# Deployment workshop

## Stage 1: run the site in local Docker

The React source is the recipe. `npm run build` makes the finished static files.
A Docker image is a packed box containing those files and Nginx, the web server
that hands them to visitors. A container is that box running. Compose records how
to start it, including which local address to use.

Start Docker Desktop in Linux container mode, then run from the repository root:

```sh
docker compose build
docker compose up -d --wait
docker compose ps
```

Open http://127.0.0.1:8080. This is local access, not a public deployment. The
container listens on 8080 internally, and Compose exposes it only on this PC.
It runs without root privileges, with a read-only filesystem and temporary
writable space for Nginx under `/tmp`.

```sh
docker compose logs --tail=50 site
docker compose down
```

The first command helps diagnose problems; the second stops and removes this
Compose project's container. It keeps the built image. After source edits, run
`docker compose up -d --build --wait` to rebuild and replace the local container.

The Docker build uses `npm ci` and the committed lockfile. Its build context
allows only build inputs, excluding `.env` files, AWS credentials, Git history,
legacy artifacts and local dependencies. The Node build stage does not ship in
the Nginx runtime image. Base image tags currently track Node 22 Alpine and stable
unprivileged Nginx Alpine; select tested image digests before a production release.

## Contact configuration: pending before production

The local Docker build intentionally uses the fallback WhatsApp recipient in
`src/content.ts`. Confirm that recipient with the business before publishing.
The container does not contain or deploy the Java backend.

The existing optional API configuration needs reconciliation: the contact service
reads `BASE_API_URL` and `CONTACT_API_URL`, but Vite's default browser exposure is
limited to `VITE_` names. The type declarations already use `VITE_` names. Merely
adding environment variables when starting Nginx cannot change compiled browser
JavaScript. Decide whether production needs the API, then align the service,
example environment, tests and build arguments together if it does. Public API
URLs must use HTTPS and allow the site's origin via CORS. Never bundle secrets.

## Next workshop stages

1. Agree the hosting budget, AWS account status and whether Kubernetes is a
   learning objective. Kubernetes coordinates containers across machines; this
   static site does not itself require that coordination.
2. Create or prepare the AWS account, secure access and configure billing alerts.
   Choose a region and review an architecture and cost estimate before provisioning.
3. Choose hosting, then write reproducible infrastructure configuration. Compare
   static hosting with a container service; assess managed Kubernetes if required.
4. Deploy a test release and verify the public endpoint, assets and contact links.
5. Connect the purchased domain using DNS (the address book that points a name to
   its host) and HTTPS (encrypted browser connections). Record existing DNS first,
   particularly email records. A domain transfer is not inherently required.
6. Establish versioned releases, rollback, monitoring and automated delivery.

AWS resources, domain changes, HTTPS and the production contact destination have
not been configured or verified by this local setup.

## References

- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Unprivileged Nginx image](https://github.com/nginx/docker-nginx-unprivileged)
- [Vite public build-time environment variables](https://vite.dev/guide/env-and-mode)
