class ParticipantData {

    addressLine1: String;
    addressLine2: String;
    city: String;
    country: String;
    firstName: String;
    lastName: String;
    state: String;
    
    nameOnCard: String;
    number: Number;
    expirationMonth: Number;
    expirationYear: Number;
    securityCode: Number;
    useGift: String;
            
    email: String;
    password: String;
    verificationCode: String;
    totp2faKey: String;

    constructor(
        addressLine1: String,
        addressLine2: String,
        city: String,
        country: String,
        firstName: String,
        lastName: String,
        state: String,

        nameOnCard: String,
        number: Number,
        expirationMonth: Number,
        expirationYear: Number,
        securityCode: Number,
        useGift: String,
        

        email: String,
        password: String,
        verificationCode: String,
        totp2faKey: String,


    ) {
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.country = country;
        this.firstName = firstName;
        this.lastName = lastName;
        this.state = state;

        this.nameOnCard = nameOnCard;
        this.number = number;
        this.expirationMonth = expirationMonth;
        this.expirationYear = expirationYear;
        this.securityCode = securityCode;
        this.useGift = useGift;

        this.email = email;
        this.password = password;
        this.verificationCode = verificationCode;
        this.totp2faKey = totp2faKey;
        
    }
}

module.exports = ParticipantData;