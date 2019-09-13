FROM python:3

WORKDIR /usr/src/app

COPY deps.txt ./
RUN pip install --no-cache-dir -r deps.txt

EXPOSE 7000

COPY . .

CMD [ "python", "main.py" ]
