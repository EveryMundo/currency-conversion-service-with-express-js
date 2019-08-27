# currency-conversion-service (boilerplate)
## How to use this template
### Without using em-microservice
If you're cloning this template directly from git, please make sure you prepare your project by ensuring the following:
Please use node [v10.16 (LTS)](https://nodejs.org/ja/blog/release/v10.16.0/) to avoid compatibility issues.
##### Prepare project
1. Create your `.env` file by running `cp .env-dist .env`.
2. Create logs directory at the root of the project `mkdir logs`.
3. Run `npm run install`.

#### If you are using [em-microservice](https://www.npmjs.com/package/@everymundo/em-microservice) (*RECOMMENDED*) skip the previous section, since the package takes care of preparing the project.

### Set Up microservices local environment
To be able to register our project as a microservice we need to have 2 pieces running before we run the project itself:
1. Start the service registry by running eureka server, this can be done by running `npm run eureka`. You can verify that eureka is running by entering this address in your browser: `http://localhost:8080/eureka/`
2. Load the configuration files initiating our fake config server `npm run fake-config-server-start`, the fake files are included in the folder `resources/fake-routes` at the root of the project.

##### Run the project and register to eureka
Just run `npm run local` and refresh the eureka page once, you should be able to see the application registered under "Instances currently registered with Eureka"