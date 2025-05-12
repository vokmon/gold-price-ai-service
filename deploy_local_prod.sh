docker build --pull --rm -f 'Dockerfile' -t 'goldpriceaiservice:latest' '.'
docker run -d --name goldpriceaiservice goldpriceaiservice:latest
