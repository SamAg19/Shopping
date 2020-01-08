pragma solidity ^0.4.25;

contract Shop {
    struct Item {
        uint id;
        address seller;
        string item_name;
        uint price;
        uint stock;
        address SoldTo;
		bool IsSold;
    }
    
    struct History {
        uint[] id;
    }
    
    struct Buyer
    {
        uint[] id;
    }
    
    mapping (address=>Buyer) buyers;
    mapping (uint=>Item) public items;
    uint public item_id;
    mapping (string=>History) history;
    mapping (uint=>bool) item_existence;
    mapping (address=>bool) public is_buyer;
    mapping (address=>bool) public is_seller;
    mapping (string=>bool) item;
    
    event Sell(
        address Seller, 
        string name, 
        uint price
        );
    
    event Buy(
        address BoughtFrom, 
        address BoughtBy, 
        string ItemBought, 
        uint ItemPrice
        );
    
    function SellingItems (string _item_name, uint _price) public {
        require(_price!=0 && keccak256(abi.encodePacked((_item_name))) != keccak256(abi.encodePacked((""))),"Illegitmate Registration");
        item_id++;
        items[item_id].id = item_id;
        items[item_id].seller=msg.sender;
        items[item_id].item_name=_item_name;
        items[item_id].price=_price;
        items[item_id].stock = 1;
	items[item_id].IsSold = false;
        is_seller[msg.sender]=true;
        item[_item_name]=true;
        item_existence[item_id]=true;
        history[_item_name].id.push(item_id);
        emit Sell(msg.sender,_item_name,_price);
    }
    
    function FindItems_withID (uint _item_id) public constant returns (address,string,uint,address) {
        if (item_existence[_item_id]!=true) revert();
        return (items[_item_id].seller,items[_item_id].item_name,items[_item_id].price,items[_item_id].SoldTo);
    }
    
    function FindItems_withName (string _item_name) public constant returns (uint) {
        if(item[_item_name]==true){
            return history[_item_name].id[history[_item_name].id.length-1];
        }
        else{ return 0;}
    }
    
    function getL() public constant returns (uint) {
        return buyers[msg.sender].id.length;
    }
    
    function getID(uint index) public constant returns (uint) {
        return buyers[msg.sender].id[index];
    }
    
    function getHistoryL(string _item_name) public constant returns (uint) {
        return history[_item_name].id.length;
    }
    
    function getID(string _item_name,uint index) public constant returns (uint) {
        return history[_item_name].id[index];
    }

    function BuyItems (uint _item_id) public payable {
        uint price = items[_item_id].price * 1000000000000000000;
        address myAddress = msg.sender;
        address s = items[_item_id].seller;
		require(items[item_id].IsSold == false,"Product not available");
        require(myAddress.balance >= price, "Not enough balance"); 
        require(item_existence[_item_id]==true, "Item does not exist");
        require(msg.value==price,"This is not the correct amount");
        require(myAddress!=s,"You are the owner of this product");
        s.transfer(msg.value);
		items[item_id].IsSold = true;
		uint flag = 0;
        items[item_id].stock = 0;
		for (uint i = 0; i < getL(); i++) {
			if(_item_id==getID(i)) {
				flag = 1;
				break;
			}
		}
		if (flag == 0) {
		    buyers[myAddress].id.push(_item_id);
		}
		items[_item_id].SoldTo = myAddress;
        is_buyer[myAddress]=true;
        emit Buy(s,myAddress,items[_item_id].item_name,items[_item_id].price);
    }    
} 
