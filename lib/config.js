// Container for all the environments
var environments = {};

// Staging (default) environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'ACcaf97d99c62c381f569a897e37696ee4',
        'authToken' : '43f762055e1f4405b6ca8429acffe877',
        'fromPhone' : '+17743533169'
    }
};

// Production environment
environments.production = {
    'httpPort' : 80,
    'httpsPort' : 443,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoSecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : '',
        'authToken' : '',
        'fromPhone' : ''
    }
};

// Determine environment to be exported, as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check the current environment is defined, else, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;