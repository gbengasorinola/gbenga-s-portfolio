# Deploying a Personal Web Portfolio on AWS EC2 And Reverse Proxy With NGINX

## Overview
The personal portfolio is a web app that include a short pitch on CampaignIQ, an AI-powered, all-in-one platform revolutionizing digital advertising for businesses and agencies. It also include a short bio about me and a contact form that allows users to send me messages directly from the web app to my gmail mailbox. 

The web app is designed to be personalised. When the web app launches, users are requested to enter their name, and the web app will greet them with a personalized message. If they enter an email address or text that contains numbers, the web app will validate the input and display an error message.

The web app built using Node.js, Express, HTML, JS, and CSS, and it is hosted on an AWS EC2 instance. The web app is reverse proxied using NGINX to handle incoming requests and serve the content securely over HTTPS.


This guide walks through the step-by-step process I followed to: 
- provision a Ubuntu Linux server on AWS EC2
- developed a web server using Node.js
- push my portfolio web app to the EC2 server using GIT
- set up a custom domain
- reverse proxy my portfolio web app using NGINX
- secure it with HTTPS.

## Prerequisites
- An AWS account
- Basic knowledge of AWS EC2, NGINX, Node.js, and Git
- A custom domain (optional, but recommended for production)
- A local machine with Node.js and npm installed
- A code editor (e.g., Visual Studio Code)


## TABLE OF CONTENTS
- [Deploying a Personal Web Portfolio on AWS EC2 And Reverse Proxy With NGINX](#deploying-a-personal-web-portfolio-on-aws-ec2-and-reverse-proxy-with-nginx)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Provision a Ubuntu Linux Server on AWS EC2](#provision-a-ubuntu-linux-server-on-aws-ec2)
    - [SSH into the EC2 Server](#ssh-into-the-ec2-server)
    - [Update and Upgrade Packages](#update-and-upgrade-packages)
    - [Install Required Applications](#install-required-applications)
    - [Initialise and Enable NGINX](#initialise-and-enable-nginx)
    - [Enable Firewall and Allow Ports](#enable-firewall-and-allow-ports)
    - [Allow Required Ports on AWS EC2 Console](#allow-required-ports-on-aws-ec2-console)
  - [Creating A Web App Using `Node.js` on VSCode (Local Machine Bash Terminal)](#creating-a-web-app-using-nodejs-on-vscode-local-machine-bash-terminal)
  - [Push The Web App to GitHub from Local Machine](#push-the-web-app-to-github-from-local-machine)
  - [Clone GitHub Repo to altschool-cloud-exam EC2 Server](#clone-github-repo-to-altschool-cloud-exam-ec2-server)
    - [Install PM2 to Run the Node.js App](#install-pm2-to-run-the-nodejs-app)
  - [Link The EC2 Instance IP Address to A Custom Domain](#link-the-ec2-instance-ip-address-to-a-custom-domain)
  - [Set Up NGINX As Reverse Proxy](#set-up-nginx-as-reverse-proxy)
  - [Secure Domain with SSL Using Certbot](#secure-domain-with-ssl-using-certbot)
  - [Access the Portfolio Web App Securely](#access-the-portfolio-web-app-securely)
  - [✅ Done!](#-done)

---

## Provision a Ubuntu Linux Server on AWS EC2
After logging to the [AWS console](https://console.aws.amazon.com), I navigated to EC2 under Services and launched a new instance under the `eu-west-2` region.

Here are the configuration details for the Instance:
- **Name**: altschool-cloud-exam
- **Amazon Machine Image**: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type 
- **Architecture**: 64-bit(x86)
- **Instance type**: t2.micro (free tier eligible)
- **Key pair**: Created a RSA .pem key pair named lnd-key-exam
- **Security group**: Left the default configuration for the security group
- **Storage**: 24 GiB

Then I launched the instance.

---

### SSH into the EC2 Server
For CLI, I am using [Termius](https://termius.com/) running on my local machine. To connect to the EC2 sever, I will SSH into it using the `lnd-key-exam.pem` key pair I generated while creating a new instance.
- Opened a terminal on Termius
- Navigated to the directory where the key pair is stored: `/Users/apple/Documents/Altschool 2nd Semester Exam`
- Set the right permission for the key:
```bash
chmod 400 lnd-key-exam.pem
```
- SSH into the server
```bash
ssh -i "lnd-key-exam.pem" ubuntu@ec2-18-169-171-45.eu-west-2.compute.amazonaws.com
```

---

### Update and Upgrade Packages
I updated and upgraded on the packages on the server:
```bash
sudo apt update
sudo apt upgrade
```

---

### Install Required Applications
The required apps needed to setup, deploy and manage a web server, and manage firewall include nginx, apache2, ufw
```bash
sudo apt install nginx # web servers
sudo apt install apache2 # web servers
sudo apt install ufw # firewall management
sudo apt install git # version control and management
sudo apt install ssh # access and control a remote server
sudo apt install -g pm2 # run, manage, and monitor node.js app
```

---

### Initialise and Enable NGINX
For this project, I am using `nginx`to reverse proxy my `nodejs` web app. `nginx` is a web server used to serve web content, handle load balancing, secure the web app with HTTPS, and reverse proxy web apps (to mask the backend port).

Using `systemctl`, a tool to manage `systemd` services, to start and enable nginx:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

---

### Enable Firewall and Allow Ports
Using `ufw`, I allowed the ports required to enable the web app accessible over the internet:
```bash
sudo ufw enable
sudo ufw allow 80 # HTTP
sudo ufw allow 443 # HTTPS
sudo ufw allow 'Nginx HTTP'
```
Checking the list of allowed ports
```bash
sudo ufw status numbered
```
---

### Allow Required Ports on AWS EC2 Console
To allow inbound traffic from the internet on those ports to my EC2 server, I navigated to **Security Groups** linked to the EC2 instance and added **Inbound Rules** for:

  ```
  HTTP  | Port 80  | Source 0.0.0.0/0 and ::/0
  HTTPS | Port 443 | Source 0.0.0.0/0
  HTTPS | Port 3000 | Source 0.0.0.0/0
  ```

---

## Creating A Web App Using `Node.js` on VSCode (Local Machine Bash Terminal)
1. **Created a project folder and entered it**:
```bash
mkdir gbenga-portfolio
cd gbenga-portfolio
```

2. **Installed `node.js` and `npm`, which is `node.js` package manager**:
```bash
brew install nodejs
brew install npm -y
```

3. **Initialise `node.js` project, which creates a `package.json` file to manage dependencies**:
```bash
npm init
```

4. **Install the required modules for the web app**:

    **Express**:
    - to serve `HTML`, `CSS`, `JS`, the video, and the image of the portfolio 
    - process HTTP requests
    - handle routing
    - modify requests and responses

    **body-parser**:
    - parses incoming data from the form on the portfolio page and make it accessible in my `node.js` code

    **nodemailer**:
    - allows the form data to be sent to my mailbox via Gmail.

```bash
npm install express
npm install nodemailer
npm install body-parser
```

5. **Setup the web app**:
I created a `server.js` that does the following:
- load the required modules (`express`, `body-parser`, and `nodemailer`)
- serve the portfolio page static files (html, css, js, and media files)
- handle form submissions
- run the web app locally on http://127.0.0.1:3000

6. **Create a public folder for the portfolio web app static files**:
```bash
mkdir public
```

7. **Move the static files to the public folder**:

    I have already created HTML, CSS, and JS files. So, I simply moved them to the public folder.

---
## Push The Web App to GitHub from Local Machine

1. **Generate SSH Key**:
To push the web app to GitHub, I have to first generate an SSH key that will enable me connect my local machine to GitHub.

```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub 
```

2. Logged in to [GitHub](https://github.com) and created a repo for the project: `gbenga-s-portfolio`
3. Navigated to the `Settings` tab of the repo, opened `Deploy Keys`, and added the SSH key generated above as a deploy key.

4. **Connect Git to GitHub repo**:

    I returned to the vscode `bash` terminal and connected the local `git` to the GitHub repo using the SSH URL of the repo.

```bash
git init
git remote set-url origin git@github.com:gbengasorinola/gbenga-s-portfolio.git
```

5. **Push code**:
   
    I pushed the web app files, which includes the `server.js`, `public` folder, and the `package.json` file, to the GitHub repo.

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## Clone GitHub Repo to altschool-cloud-exam EC2 Server
Having pushed the web app to GitHub, I can now clone the repo to the EC2 server.

1. **Generate SSH Key**

    I have to generate a new SSH key on the EC2 server to connect it to the GitHub repo. This is because the SSH key generated on my local machine is not accessible on the EC2 server.

    From the Termius terminal, I SSH into the EC2 server and ran the following commands to generate a new SSH key and copy the public key:

```bash
ssh-keygen -t ed25519 -C "ec2-deploy"
cat ~/.ssh/id_ed25519.pub 
```

2. **Add the SSH Key to GitHub**:

    I logged in to [GitHub](https://github.com), navigated to the `Settings` tab of the repo, opened `Deploy Keys`, and added the SSH key generated above as a deploy key.

3. **Clone the repo**
    
    From the Termius terminal, I cloned the GitHub repo to the EC2 server:

```bash
git clone git@github.com:gbengasorinola/gbenga-s-portfolio.git
```
---

### Install PM2 to Run the Node.js App
1. **Install PM2**:

    I entered the cloned repo directory and installed `pm2`, a process manager for Node.js applications, to run the Node.js app in the background.

```bash
cd gbenga-s-portfolio
sudo npm install -g pm2
```

2. **Run the Node.js app**:

    I ran the Node.js app using `pm2` and set it to restart automatically if it crashes or the server restarts.

```bash
pm2 start server.js --name "gbenga-portfolio"
pm2 save
pm2 startup
``` 

Now the web app is running on port `3000` of the EC2 server - on http://127.0.0.1:3000

---

## Link The EC2 Instance IP Address to A Custom Domain

1. I went to [https://www.duckdns.org](https://www.duckdns.org) and created an account.
2. I created a subdomain `gbenga-sorinola.duckdns.org`.
3. I pointed the domain to the EC2 instance's **public IP**: 18.169.171.45

---

## Set Up NGINX As Reverse Proxy
1. **Create a new NGINX configuration file**:

    I created a new configuration file for the portfolio app in the `/etc/nginx/sites-available/` directory:

```bash
sudo nano /etc/nginx/sites-available/gbenga-portfolio
```
2. **Add the following configuration**:
   
    I configured `nginx` to listen on port `80` and forward requests to the web app running on port `3000`:

```nginx
server {
    listen 80;
    server_name gbenga-sorinola.duckdns.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable the configuration**:

    I created a symbolic link to the `sites-enabled` directory to enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/gbenga-portfolio /etc/nginx/sites-enabled/
```
4. **Test the NGINX configuration**:

    I tested the NGINX configuration to ensure there are no syntax errors:

```bash
sudo nginx -t
```
5. **Restart NGINX**:

    I restarted NGINX to apply the changes:

```bash
sudo systemctl restart nginx
```

6. **Access the web app**:

    I can now access the portfolio web app using the custom domain: [gbenga-sorinola.duckdns.org](http://gbenga-sorinola.duckdns.org)

---

## Secure Domain with SSL Using Certbot
Certbot is a tool that automates the process of obtaining and installing SSL certificates from Let's Encrypt. 

It offers free SSL certificates, which are valid for 90 days and can be renewed automatically.

To secure the custom domain with SSL, I followed these steps:
1. **Install Certbot**:

    I installed Certbot and the NGINX plugin on the EC2 server:

```bash
sudo apt install certbot
sudo apt install python3-certbot-nginx -y
sudo certbot --nginx -d gbenga-sorinola.duckdns.org
```

This command will automatically obtain and install a free SSL certificate from Let's Encrypt for the domain `gbenga-sorinola.duckdns.org`.

It will also configure NGINX to use the SSL certificate, enabling HTTPS for the domain.


---
## Access the Portfolio Web App Securely
Now, I can access the portfolio web app securely using HTTPS:

- [gbenga-sorinola.duckdns.org](https://gbenga-sorinola.duckdns.org)

---

## ✅ Done!

The personal portfolio is now live, secure, and running on a custom domain.

---
