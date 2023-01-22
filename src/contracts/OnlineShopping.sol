pragma solidity ^0.5.0;
// SPDX-License-Identifier: MIT
contract OnlineShopping{
    string public name;
    mapping(uint => Package) public packages;
    uint public packageCount = 0;

    constructor() public{
        name="Online Shopping";
    }

    struct Package{
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event PackageCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event PackagePurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    function createPackage(string memory _name, uint _price) public {
        // Require a valid name
        require(bytes(_name).length > 0, "Paket bir isme sahip olmali");
        // Require a valid price
        require(_price > 0, "Paketin bir fiyati olmali");
        // Increment product count
        packageCount ++;
        // Create the product
        packages[packageCount] = Package(packageCount, _name, _price, msg.sender, false);
        // Trigger an event
        emit PackageCreated(packageCount, _name, _price, msg.sender, false);
    }
    function purchasePackage(uint _id) public payable {
         // Fetch the product
        Package memory _package = packages[_id];
        // Fetch the owner
        address payable _seller = _package.owner;
        // Make sure the product has a valid id
        require(_package.id > 0 && _package.id <= packageCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _package.price);
        // Require that the product has not been purchased already
        require(!_package.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to the buyer
        _package.owner = msg.sender;
        // Mark as purchased
        _package.purchased = true;
        // Update the product
        packages[_id] = _package;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit PackagePurchased(packageCount, _package.name, _package.price, msg.sender, true);
    }
 
}