// https://www.amazon.com/dp/B00NTCH52W/

import { UserMetadata } from "firebase-admin/lib/auth/user-record";

const axios = require('axios');
const crypto = require('crypto')


const ParticipantData = require('./participantData');

// // The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');

admin.initializeApp();

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// Import Admin SDK
// const { getDatabase } = require('firebase-admin/database');

// Get a database reference to our blog
// const realtimeDatabase = getDatabase();



const firestore = getFirestore();
const realtimeDatabase = admin.database();

var retailer: string;
var maxPrice: number;
var productID: string;
var quantity: number;
var buyingGroupSite: string;
var URL: String;

var firstName: String;
var lastName: String;
var addressLine1: String;
var zipCode: Number;
var city: String;
var state: String;
var country: String
var phoneNumber: Number;


export const zinc = functions.https.onRequest(async (request: any, response: any) => {
    functions.logger.info("Zinc Called!", { structuredData: true });

    // TO DO CLEAN INCOMING DATA FROM WRONG DATA
    initializeIncomingDataVariables(request);
    // TO DO -- CREATE minWalletBalanceToBuy()
    var minWalletBalanceToBuy = 60;
    var participants = await realtimeDatabase.ref('wallet').orderByChild('balance').startAt(minWalletBalanceToBuy).once('value');
    participants.forEach((user: any) => {
        var participantUID = user.key;
        var idempotencyKey = crypto.randomUUID({ disableEntropyCache: true });
        const newOrderRef = realtimeDatabase.ref(`orderHistoy/${participantUID}`).push({
            buyingGroupSite: buyingGroupSite,
            idempotencyKey: idempotencyKey,
            productURL: 'productURL',
            productName: 'productName',
            price: 'price',
            imageURL: 'imageURL',
            status: 'initiated'
        });
        const uniqueKey = newOrderRef.key;
        getParticipantData(participantUID).then((participantData) => callZinc(uniqueKey, idempotencyKey, participantData));

    });


    response.status(200).send("Recived!");
});


async function initializeIncomingDataVariables(request: any) {
    retailer = request.body.retailer;
    maxPrice = request.body.maxPrice;
    productID = request.body.productID;
    quantity = request.body.quantity;
    buyingGroupSite = request.body.buyingGroupSite;
    URL = request.body.URL;
}


async function getParticipantData(participantUID: String) {
    var participantData;
    const userDoc = await firestore.collection('users').doc(participantUID).get();
    if (userDoc.empty) {
        throw Error(`Expected USER: ${participantUID} But not found`);
    } else {
        participantData = userDoc.data();
    }
    return participantData;
}



async function callZinc(uniqueKey: any, idempotencyKey: any, participantData: { shippingAddress: any; paymentMethod: any; billingAddress: any; retailerCredentials: any; }) {
    //    TO DO -- MOVE MAX_PRICE_SHIPPING Somewehere else
    const MAX_PRICE_SHIPPING = 0;

    var shippingAddress = participantData.shippingAddress;
    var paymentMethod = participantData.paymentMethod;
    var billingAddress = participantData.billingAddress;
    var retailerCredentials = participantData.retailerCredentials;

    const res = await axios.post(
        'https://eoar59hi0w5w6bv.m.pipedream.net',
        {
            "idempotency_key": idempotencyKey,
            'retailer': retailer,
            'products': [
                {
                    'product_id': productID,
                    'quantity': quantity
                }
            ],
            'max_price': maxPrice,
            'shipping_address': {
                "first_name": shippingAddress.firstName,
                "last_name": shippingAddress.lastName,
                "address_line1": shippingAddress.address_line1,
                "address_line2": shippingAddress.address_line2,
                "zip_code": shippingAddress.zip_code,
                "city": shippingAddress.city,
                "state": shippingAddress.state,
                "country": shippingAddress.country,
                "phone_number": shippingAddress.phone_number
            },
            'is_gift': true,
            'gift_message': 'Here is your package, Tim! Enjoy!',
            'shipping': {
                'order_by': 'speed',
                'max_days': 5,
                'max_price': MAX_PRICE_SHIPPING
            },
            'payment_method': {
                'name_on_card': paymentMethod.nameOnCard,
                'number': paymentMethod.number,
                'security_code': paymentMethod.securityCode,
                'expiration_month': paymentMethod.expirationMonth,
                'expiration_year': paymentMethod.expirationYear,
                'use_gift': paymentMethod.useGift
            },
            'billing_address': {
                'first_name': billingAddress.firstName,
                'last_name': billingAddress.lastName,
                'address_line1': billingAddress.addressLine1,
                'address_line2': billingAddress.addressLine2,
                'zip_code': billingAddress.zipCode,
                'city': billingAddress.city,
                'state': billingAddress.state,
                'country': billingAddress.country,
                'phone_number': billingAddress.phoneNumber
            },
            'retailer_credentials': {
                'email': retailerCredentials.email,
                'password': retailerCredentials.password,
                'totp_2fa_key': retailerCredentials.totp2faKey
            },
            'webhooks': {
                'request_succeeded': `http://mywebsite.com/zinc/request_succeeded?id=${uniqueKey}`,
                'request_failed': `http://mywebsite.com/zinc/requrest_failed?id=${uniqueKey}`,
                'tracking_obtained': `http://mywebsite.com/zinc/tracking_obtained?id=${uniqueKey}`
            },
            'client_notes': {
                'our_internal_order_id': 'abc123',
                'any_other_field': [
                    'any value'
                ]
            }
        },
        {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: '11111111111'
            }
        }
    );
}



