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
            return App.render();
        });
    },

	render: function() {
		var shopInstance;
		var loader = $("#loader");
		var content = $("#content");

		loader.show();
		content.hide();

		web3.eth.getCoinbase(function(err, account) {
		  if (err == null) {
		    App.account = account;
		    $("#accountAddress").html("Your Account: " + account);
		  }
		});
		
		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
        	return shopInstance.item_id();
        }).then(function(count) {
      		var items = $("#items");
      		items.empty();
        	for (var i = 1; i <= count; i++) {
        		shopInstance.items(i).then(function(item) {
				var id = item[0];
          		var seller = item[1];
          		var itemname = item[2];
				var price = item[3];
				var Sold_to = item[5];
				var length;
				console.log("id: "+id);
				if(seller==App.account){
					var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + seller +"</td><td>"  + Sold_to + "</td></tr>";
					items.append(itemTemplate);
				}
				});
			}
			loader.hide();
			content.show();
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
