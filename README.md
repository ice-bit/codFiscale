# codFiscale

codFiscale è una webapp scritta in Typescript per calcolare il 
codice fiscale e il suo inverso. 
L'applicazione è accessibile a [https://cf.marcocetica.com](https://cf.marcocetica.com).

Il **frontend** è stato realizzato utilizzando Bootstrap, mentre il **backend** è stato
realizzando mediante il framework Express. La codebase del backend segue il paradigma
funzionale ed è stata realizzata utilizzando la libreria [fp-ts](https://gcanti.github.io/fp-ts/).

Questa webapp si avvale di un database SQLite per organizzare i _codici catastali_ e i
_codici nazionali_, i quali vengono scaricati in maniera automatizzata(vedi [aggiornamento-databases](#aggiornamento-databases)), 
rispettivamente, dal [sito del ministero dell'interno](https://dait.interno.gov.it/territorio-e-autonomie-locali/sut/elenco_codici_comuni.php")
e dal [sito dell'ISTAT](https://www.istat.it/it/archivio/6747). Per velocizzarne l'accesso,
i codici catastali e nazionali vengono salvati inoltre in una cache in RAM utilizzando 
il database key-value **Redis**.

## Deploy
Il metodo di deploy supportato è mediante Docker. Per lanciare la webapp è dunque necessario 
eseguire il seguente comando:
```shell
$> docker-compose up -d
```

Di default sono utilizzati i seguenti parametri:
- Host: `127.0.0.1`;  
- Porta: `9000`;  
- Host Redis: `127.0.0.1`;  
- Porta Redis: `6379`.

Nel caso alcune di queste variabili d'ambiente dovessero collidere con
le configurazioni di altri servizi in esecuzione, sarà possibile alterarle andando a modificare i file
`Dockerfile` e `docker-compose.yml` dalla root del progetto.

Una volta lanciato i due container(quello della webapp e quello della cache Redis) è
preferibile esporre l'applicazione solo attraverso un **reverse proxy**; il metodo supportato
ufficialmente è tramite NGINX. Per farlo, aggiungere la seguente voce in un nuovo 
virtual host:
```nginx
location / {
    proxy_pass http://127.0.0.1:9000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Nel caso si fosse scelto una porta differente, si modifichi la proprietà `proxy_pass`
in modo appropriato.

## Aggiornamento Databases
Di default la webapp fornisce un database(`codes.db`) contenente due tabelle: una per 
i codici catastali e una per quelli nazionali. Nel caso fosse necessario
aggiornare i codici con dati più recenti(ad esempio a seguito della soppressione di 
un comune), seguire la seguente procedura:

1. Scaricare dal [sito dell'ISTAT](https://www.istat.it/it/archivio/6747)
l'**elenco codici e denominazioni delle unità territoriali estere** in formato `zip` 
alla voce _Elenco codici e denominazioni delle unità territoriali estere_. 
2. Scompattare dall'archivio solo il file in formato `csv`.
2. Il file è in formato `latin1`(ISO-8859), prima di poterlo utilizzare, è necessario convertirlo
in formato UTF8. Per farlo eseguire il comando:
```shell
$> iconv -f ISO-8859-11 tabella.csv -t UTF-8 -o tabella.csv
```
3. Normalizzare il file in formato csv(i.e. sostituire `;` con `,`):
```shell
$> sed -i 's/;/,/g' tabella.csv
```
4. Eliminare le linee vuote utilizzando il seguente comando:
```shell
$> sed -i '/^,/d' tabella.csv
```
5. Convertire il file in formato `csv` in un file `sql` utilizzando lo 
script `codnazioni.py`:
```shell
$> python3 codnazioni.py tabella.csv codnazioni.sql
```
6. Scaricare i codici catastali utilizzando lo script `codcatastali.py`(dipendenze: `beautifulsoup4` e `requests`):
```shell
$> python3 codcatastali.py codcatastali.sql
```
7. Creare il database con il seguente comando:
```shell
$> sqlite3 codes.db < cod{nazioni,catastali}.sql
```
Il file `codes.db`, presente nella root del progetto, verrà inserito all'interno del container durante
la fase di deploy.


## Sviluppo
Per poter modificare o aggiungere funzionalità alla webapp è necessario avere installato
**nodeJS**(versione LTS) e un server **Redis** in esecuzione. È altresì necessario 
configurare le seguenti variabili d'ambiente:
- HOST: `127.0.0.1`;
- PORT: `9000`;
- REDIS_HOST: `127.0.0.1`;
- REDIS_PORT: `6379`

Fatto ciò è sufficiente installare le dipendenze di sviluppo e avviare la web app
in modalità _development_:
```shell
$> cd codFiscale
$> npm install
$> npm run start:dev
/usr/bin/npm run start:dev

> codfisc@1.0.0 start:dev
> nodemon

[nodemon] 2.0.20
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,js
[nodemon] starting `ts-node ./server.ts & sass --watch scss/style.scss static/css/style.css`
Sass is watching for changes. Press Ctrl-C to stop.

Server listening on http://127.0.0.1:3000
```

Oltre al profilo `start:dev`, la webapp ne supporta altri 5:
- `test`: Per eseguire tutti gli unit tests;
- `scss`: Per compilare i file SCSS;  
- `build`: Per invocare il transpiler Typescript;  
- `start`: Per eseguire la webapp tramite node(i.e. senza compilare i file `.ts`);  
- `start:prod`: Per avviare la webapp mediante il process manager `pm2`.

## Unit Tests
Nella cartella `tests/` sono presenti alcuni test unitari per verificare il corretto funzionamento
delle singole parti del software. Per poter invocare il motore di testing(`jest`) è 
sufficiente digitare:
```shell
$> npm run test
> codfisc@1.0.0 test
> jest

 PASS  tests/reverse.test.ts
 PASS  tests/codFisc.test.ts
```

## Licenza
[GPLv3](https://choosealicense.com/licenses/gpl-3.0/)