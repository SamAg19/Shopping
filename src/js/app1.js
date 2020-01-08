App = {
    web3Provider: null,
    contracts: {},
    url: 'http://127.0.0.1:7545',
    account: '0x0',
    hasBought: false,

    init: function() {
        console.log("App Initialized...");
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
			App.listenForEvents();
            return App.render();
        });
    },

  	listenForEvents: function() {
		App.contracts.Shop.deployed().then(function(instance) {
      		instance.Sell({}, {
        		fromBlock: 0,
        		toBlock: 'latest',
      		}).watch(function(error, event) {
        		console.log("Item added to the store", event);
        		App.render();
      		})
    	})
  	},

    render: function() {
        var shopInstance;
    	var loader = $("#loader");
    	var form = $("#formgroup");

    	loader.show();
    	form.hide();

        web3.eth.getCoinbase(function(err, account) {
            if(err == null) {
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
        });

    	App.contracts.Shop.deployed().then(function(instance) {
      		shopInstance = instance;
      		loader.hide();
		form.show();
    	}).catch(function(error) {
      		console.warn(error);
    	});
    },

    submit: function() {
	var shopInstance;
	var ItemName = $('#ItemName').val();
	var Price = $('#Price').val();
	ItemName = ItemName.toUpperCase();
	var check = document.getElementById("CB").checked;
	if(check == true) {
		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
			return shopInstance.SellingItems(ItemName, Price, { from: App.account });
		}).then(function(result) {
			console.log("Item Registered...");
			return shopInstance.item_id();
		}).then(function(count) {
			alert("Item Registered. The Item Id of this product is "+count);
			$('form').trigger('reset');
		});
	}
	else {
		alert("PLEASE TICK THE CHECKBOX TO PROCEED WITH ITEM REGISTRATION");
	}
    }
}

$(function() {
    $(window).load(function() {
      App.init();
    })
  });
