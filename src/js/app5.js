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
		web3.eth.getCoinbase(function(err, account) {
		  if (err == null) {
		    App.account = account;
		  }
		});

		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
			var items = $("#items");
      		items.empty();
			shopInstance.getL({from: App.account}).then(function(l) {
				console.log("length: "+l);
				for (var i = 0; i < l; i++) {
					shopInstance.getID(i,{from:App.account}).then(function(id) {
						shopInstance.items(id).then(function(item) {
							var id = item[0];
		      				var seller = item[1];
		      				var itemname = item[2];
							var price = item[3];
							var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + seller +"</td><td><button id=\"buy\" class = \"btn btn-default btn-sell\" type = \"button\" data-id=\""+id+"\">Sell this item</button></td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";;
							items.append(itemTemplate);
						});
					});
				}
			});
		});
		return App.bindevent();
	},
	
	bindevent: function() {
		$(document).on('click','.btn-sell',App.sell);
		$(document).on('click','.btn-hist',App.History);
	},

    sell: function(event) {
		event.preventDefault();
		var itemid = parseInt($(event.target).data('id'));
		var shopInstance;
		var ItemName;
		var Price;
		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
			shopInstance.items(itemid).then(function(i) {
				ItemName = i[2];
				Price = i[3];
				return shopInstance.SellingItems(ItemName, Price, { from: App.account });
			}).then(function(result) {
				console.log("Item Registered...");
				return shopInstance.item_id();
			}).then(function(count) {
				alert("Item Registered. The Item Id of this product is "+count);
				});
		});
    }

}

$(function() {
    $(window).load(function() {
      App.init();
    })
  });
