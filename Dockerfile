FROM denoland/deno:debian

WORKDIR /app
USER deno

COPY ./deps.ts ./
RUN deno cache deps.ts

COPY ./ ./
RUN deno cache main.ts

CMD ["task", "start"]
