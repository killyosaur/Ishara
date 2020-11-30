FROM nginx:latest

COPY build/* /var/www/html/
COPY nginx-config/* /etc/nginx/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

