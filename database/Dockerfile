FROM postgres:12.22

ENV POSTGRES_USER=postgres

ENV POSTGRES_PASSWORD=postgres

ENV POSTGRES_DB=WB_Database

COPY ./WB_Database_Setup.sql /docker-entrypoint-initdb.d

COPY ./functions.sql /docker-entrypoint-initdb.d

EXPOSE 5432

