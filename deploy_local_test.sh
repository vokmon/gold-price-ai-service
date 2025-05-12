docker build --pull --rm -f 'DockerfileTest' -t 'goldpriceaiservicetest:latest' '.'
docker run -d --name goldpriceaiservice_test goldpriceaiservicetest:latest
