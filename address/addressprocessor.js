var ed  = require('ed25519'),
    bignum = require('bignum'),
    Account = require("../account").account,
    crypto = require("crypto"),
    /*getSECCurveByName = require('../ec').sec,
    ripemd160 = require("../ec").ripemd160,*/
    Address = require("./address.js"),
    utils = require("../utils.js");

function integerToBytes(i, len) {
    var bytes = i.toByteArrayUnsigned();

    if (len < bytes.length) {
        bytes = bytes.slice(bytes.length-len);
    } else while (len > bytes.length) {
        bytes.unshift(0);
    }

    return bytes;
};

var addressprocessor = function () {
    this.addresses = {};
    this.unconfirmedAddresses = {};
}

addressprocessor.prototype.newAddress = function () {
    var randomBytes = crypto.randomBytes(100);
    var hash = crypto.createHash('sha256').update(randomBytes).digest();
    var keypair = ed.MakeKeypair(hash);

    var publicKeyHash = crypto.createHash('sha256').update(keypair.publicKey).digest();
    var temp = new Buffer(8);
    for (var i = 0; i < 8; i++) {
        temp[i] = publicKeyHash[7-i];
    }

    var address = bignum.fromBuffer(temp).toString() + "D";
    return { address : address, keypair : keypair };
}

addressprocessor.prototype.setApp = function (app) {
    this.app = app;
}

addressprocessor.prototype.processAddress = function (addr, sendToPeers) {
    if (this.unconfirmedAddresses[addr.id] || this.addresses[addr.id]) {
        return false;
    } else {
        if (!addr.verify() || !addr.accountVerify()) {
            this.app.logger.error("Address not verified: " + addr.id + ", verify: " + addr.verify() + "/" + addr.accountVerify());
            return false;
        }

        var account = this.app.accountprocessor.getAccountByPublicKey(addr.generatorPublicKey);

        if (!account || account.getEffectiveBalance() <= 0) {
            this.logger.error("Account not found or effective balance equal 0: " + account.address + "/" + account.getEffectiveBalance() + " for address: " + addr.id);
            return false;
        }

        this.unconfirmedAddresses[addr.id] = addr;

        if (sendToPeers) {
            app.peerprocessor.sendBlockToAll(b);
        }

        return true;
    }
}

addressprocessor.prototype.fromBytes = function (buffer) {
    var bb = ByteBuffer.wrap(buffer, true);
    bb.flip();

    var address = new Address();
    address.version = bb.readInt();
    address.timestamp = bb.readInt();

    var id = new Buffer(8);

    for (var i = 0; i < 8; i++) {
        id[i] = bb.readByte();
    }

    address.id = bignum.fromBuffer(id).toString() + "D";

    var publicKey = new Buffer(32);

    for (var i = 0; i < 32; i++) {
        publicKey[i] = bb.readByte();
    }

    address.publicKey = publicKey;

    var generatorPublicKey = new Buffer(32);

    for (var i = 0; i < 32; i++) {
        generatorPublicKey[i] = bb.readByte();
    }

    address.generatorPublicKey = generatorPublicKey;

    var signatureBuffer = new Buffer(64);

    for (var i = 0; i < 64; i++) {
        signatureBuffer[i] = bb.readByte();
    }

    address.signature = signatureBuffer;

    var accountSignatureBuffer = new Buffer(64);

    for (var i = 0; i < 64; i++) {
        accountSignatureBuffer[i] = bb.readByte();
    }

    address.accountSignature = accountSignatureBuffer;

    return address;
}

addressprocessor.prototype.fromByteBuffer = function (bb) {
    var address = new Address();
    address.version = bb.readInt();
    address.timestamp = bb.readInt();

    var id = new Buffer(8);


    for (var i = 0; i < 8; i++) {
        id[i] = bb.readByte();
    }

    address.id = bignum.fromBuffer(id).toString() + "D";

    var publicKey = new Buffer(32);

    for (var i = 0; i < 32; i++) {
        publicKey[i] = bb.readByte();
    }

    address.publicKey = publicKey;

    var generatorPublicKey = new Buffer(32);

    for (var i = 0; i < 32; i++) {
        generatorPublicKey[i] = bb.readByte();
    }

    address.generatorPublicKey = generatorPublicKey;

    var signatureBuffer = new Buffer(64);

    for (var i = 0; i < 64; i++) {
        signatureBuffer[i] = bb.readByte();
    }

    address.signature = signatureBuffer;

    var accountSignatureBuffer = new Buffer(64);

    for (var i = 0; i < 64; i++) {
        accountSignatureBuffer[i] = bb.readByte();
    }

    address.accountSignature = accountSignatureBuffer;

    return address;
}

module.exports = addressprocessor;