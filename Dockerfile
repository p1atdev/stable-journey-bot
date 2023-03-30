FROM denoland/deno:1.32.1

WORKDIR /app
USER deno

COPY ./deps.ts ./
RUN deno cache deps.ts

COPY ./ ./
RUN deno cache main.ts

CMD ["task", "start"]
