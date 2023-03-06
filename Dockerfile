FROM ubuntu:20.04

ADD requirements.txt /app/requirements.txt

RUN apt update

ARG DEBIAN_FRONTEND=noninteractive
RUN apt install -y python3 python3-pip gdal-bin libgdal-dev python3-gdal build-essential libcairo2-dev libpango-1.0-0 libpangocairo-1.0-0 git
RUN apt-get update
RUN apt-get install -y libgl1-mesa-dev
RUN apt-get install -y libglib2.0-0
RUN pip3 install --upgrade pip
RUN pip3 install --no-cache-dir -r /app/requirements.txt

WORKDIR /app

ENV VIRTUAL_ENV /venv
ENV PATH /venv/bin:$PATH

EXPOSE 8000

#CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "--worker-class", "eventlet", "IngSoft1.wsgi:application"]
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]