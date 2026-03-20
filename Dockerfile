# Use lightweight Nginx alpine image
FROM nginx:alpine

# Copy the game files to Nginx public directory
COPY ./game /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
