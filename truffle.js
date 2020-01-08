require('dotenv').config();
const HDWalletProvider= require('truffle-hdwallet-provider');

var url = new HDWalletProvider(
          process.env.DSLA_MNEMONIC_DEV,
          'https://ropsten.infura.io/v3/6a79fe27520b4393b5bfb9621d5db4b4');

module.exports = {
  networks: {
    ropsten: {
      provider: function(){
        return url;
      },
      gasPrice:25000000000,
      network_id: 3
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs:200
    }
  }
};
