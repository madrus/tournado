# Local Docker Development

Build and start the `tournado` container:

```sh
docker build -t tournado .
docker run -it --rm --name tournado -p 3000:8080 tournado
```

Rebuild and restart it:

```sh
docker ps
docker stop <container_id> (or <name>)
docker rm <container_id> (or <name>)
docker build -t tournado .
docker run -it --rm --name tournado -p 3000:8080 tournado
```

Create the session secret:

```sh
export SESSION_SECRET=$(openssl rand -hex 32)
docker run -it --rm -e SESSION_SECRET=$SESSION_SECRET --name tournado -p 3000:8080 tournado
```

# In a new terminal

```sh
docker logs tournado
```
