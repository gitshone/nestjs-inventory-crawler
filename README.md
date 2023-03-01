
# nestjs-inventory-crawler

Base implementation of the scraping mechanism using nestjs framework with strategy pattern.

Application is dockerized and is using redis for queueing, it can also be included in the caching driver.

In order to install and run this application you need to `git clone` this project into
your local environment.

After that, you'll need to create your own `.env` file, the easiest way is to copy existing
`.env.example` into your new `.env` file, and change environment variables values according to your needs:
```bash
$ cp .env.example .env
```

Next step, you need to build the docker image and run the container:
```bash
$ docker-compose up -d
```

Swagger documentation is available at:

```bash
$ http://localhost:APP_PORT/api
```

Thats it!