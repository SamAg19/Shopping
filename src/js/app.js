App = {
    web3Provider: null,
    contracts: {},
    url: 'http://127.0.0.1:7545',
    account: '0x0',
    hasBought: false,
	hasSold: false,

    init: function() {
        return App.initWeb3();
    },
    initWeb3: function() {
        if (typeof web3 != 'undefined') {
          App.web3Provider = web3.currentProvider;
          web3 = new Web3(web3.currentProvider);
        } else {
          App.web3Provider = new Web3.providers.HttpProvider(App.url);
          web3 = new Web3(App.web3Provider);
        }
        console.log("Web3 initialized...");
        return App.initContract();
    },
    initContract: function() {
        $.getJSON("Shop.json", function(shop) {
            App.contracts.Shop = TruffleContract(shop);
            App.contracts.Shop.setProvider(App.web3Provider);
            console.log("Contract initialized...");
            return App.render();
        });
    },

    render: function() {
        var shopInstance;
        var Sell_btn = $(".btn-sell");
        var gts_btn = $(".btn-gts");
		var sden_btn = $(".btn-sden");
		var bden_btn = $(".btn-bden");
        
        Sell_btn.hide();
        gts_btn.hide();
		sden_btn.hide();
		bden_btn.hide();

        web3.eth.getCoinbase(function(err, account) {
            if(err == null) {
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
        });
    
        App.contracts.Shop.deployed().then(function(instance) {
          shopInstance = instance;
          return shopInstance.is_buyer(App.account);
        }).then(function(hasBought) {
          if(hasBought) {
			bden_btn.show();
          }
          else{
			bden_btn.hide();
          }
          return shopInstance.is_seller(App.account);
        }).then(function(hasSold) {
          if(hasSold) {
            sden_btn.show();
          }
          else{
            sden_btn.hide();
          }	
		gts_btn.show();
        Sell_btn.show();
        }).catch(function(error) {
          console.warn(error);
        });
      }
}

$(function() {
    $(window).load(function() {
      App.init();
    })
  });
