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
		var byID = $("#ByID");
		var byName = $("#ByName");
		var content = $("#content");
		byName.hide();
		byID.hide();
		content.hide();
		web3.eth.getCoinbase(function(err, account) {
		  if (err == null) {
		    App.account = account;
		    $("#accountAddress").html("Your Account: " + account);
		  }
		});
		return App.bindEvents();
	},

	bindEvents: function() {
		$(document).on('click','.btn-id',App.ID);
		$(document).on('click','.btn-name',App.Name);
	},

	ID: function() {
		var byID = $("#ByID");
		var byName = $("#ByName");
		var content = $("#content");
		byName.hide();
		byID.show();
		content.hide();
	},

	Name: function() {
		var byID = $("#ByID");
		var byName = $("#ByName");
		var content = $("#content");
		byName.show();
		byID.hide();
		content.hide();
	},

	SearchByID: function() {
		var shopInstance;
		var content = $("#content");
		var id = $('#SearchByid').val();
		content.show();
		App.contracts.Shop.deployed().then(function(instance) {
          	shopInstance = instance;
			return shopInstance.FindItems_withID(id);
		}).then(function(item) {
				var items = $("#items");
      			items.empty();
		      	var seller = item[0];
		      	var itemname = item[1];
				var price = item[2];
				if (App.account != seller) {
					var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + stock +"</td><td>" + seller +"</td><td><button id=\"buy\" class = \"btn btn-default btn-buy\" type = \"button\" data-id=\""+id+"\">Buy</button></td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";
					items.append(itemTemplate);
				}
				else {
					var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + seller +"</td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";
					items.append(itemTemplate);
				}
		}).catch(function(error) {
      		console.warn(error);
    	});
		return App.events();
    },

	SearchByName: function() {
		var shopInstance;
		var content = $("#content");
		var name = $('#ItemName').val().toUpperCase();
		var c;
		content.show();
		App.contracts.Shop.deployed().then(function(instance) {
          	shopInstance = instance;
			return shopInstance.item_id();
		}).then(function(count) {
			c = count;
			return shopInstance.FindItems_withName(name);
		}).then(function(r) {
				if (r == false) {
					alert("Item does not exist");
				}
				if (r == true){
					for(var i = 1; i<=c; i++) {
						shopInstance.items(i).then(function(item) {
							if(item[2]==name) {
								var items = $("#items");
      							items.empty();
							  	var id = item[0];
						  		var seller = item[1];
						  		var itemname = item[2];
								var stock = item[3];
								var price = item[4];
								if (App.account != seller) {
									var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + stock +"</td><td>" + seller +"</td><td><button id=\"buy\" class = \"btn btn-default btn-buy\" type = \"button\" data-id=\""+id+"\">Buy</button></td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";
									items.append(itemTemplate);
								}
								else {
									var itemTemplate = "<tr><th>" + id + "</th><td>" + itemname + "</td><td>" + price + " ether</td><td>" + stock +"</td><td>" + seller +"</td><td><button class=\"btn btn-default btn-hist\" data-id=\""+itemname+"\">Item History</button><br></td></tr>";
									items.append(itemTemplate);
								}
							}
						});
					}
				}
		}).catch(function(error) {
      		console.warn(error);
    	});
		return App.events();
    },

	events: function() {
		$(document).on('click','.btn-buy',App.buy);
		$(document).on('click','.btn-hist',App.History);
	},

	buy: function(event) {
		event.preventDefault();
		var itemid = parseInt($(event.target).data('id'));
		var shopInstance;
		var price;
		var name;
		App.contracts.Shop.deployed().then(function(instance) {
			shopInstance = instance;
			return shopInstance.items(itemid).then(function(i) {
				price = i[4]*1000000000000000000;
				name = i[2];
				return shopInstance.BuyItems(itemid, {from:App.account, value: price});
				}).then(function(result) {
					if (result.receipt.status == "0x1") {
						alert("Item \""+ name +"\" bought by "+ App.account +" for price "+(price/1000000000000000000)+".");
					}
					else {
						alert("Transaction failed");
					}
			});
		}).catch(function(error) {
      		console.warn(error);
    	});
	},

	History: function(event) {
		event.preventDefault();
		var b = $(event.target).data('id');
        url = 'http://~/Ethereum/Store/src/next.html?name=' + encodeURIComponent(b);
    	document.location.href = url;
	}
}

$(function() {
    $(window).load(function() {
      App.init();
    })
  });
