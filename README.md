# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Final Product

!["Screenshot of the Registration Page"](https://github.com/Jagan-creator/tinyapp/blob/main/docs/tinyapp-registration-preview.png)
!["Screenshot of the My URLs Page"](https://github.com/Jagan-creator/tinyapp/blob/main/docs/tinyapp-myurls-preview.png)
!["Screenshot of TinyURL Creation Page"](https://github.com/Jagan-creator/tinyapp/blob/main/docs/tinyapp-create-tinyurl-preview.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Use of TinyApp will be run on port 8080 as seen in the code on `express_server.js`
- Starting the TinyApp web application can be done so by typing "npm start" into your terminal

## Using TinyApp

- Once the server is running you will be prompted with an error page asking you to either login or register
- If it is your first time using TinyApp you will be requried to register
- Please use an email that has not been taken already and your information will be stored on the user databsse for future logins!
- All URL's that you create on TinyApp will be stored to that specific user when logged in

## URL Functionality on TinyApp

### List of Possible URL Manipulation:

- You can submit new URL's to your current list of URL's
- If you want to edit a particular URL to a different URL you can do so with the EDIT button
- If you want to delete a particular URL you can do so with the DELETE button
- Every newly created URL will have a unique short URL attached to it that can be used to forward to that particular website