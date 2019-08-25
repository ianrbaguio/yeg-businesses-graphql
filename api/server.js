const express = require('express');
const graphqlHTTP = require('express-graphql');
const {buildSchema} = require('graphql');
const request = require('sync-request');
const cors = require('cors');

const app = express().use(cors());

const categoryRespond = request('GET', "https://data.edmonton.ca/resource/3trf-izgx.json?$select=business_category,count(*)&$group=business_category");
const businessesRespond = request('GET', "https://data.edmonton.ca/resource/3trf-izgx.json");

const businessCategories = JSON.parse(categoryRespond.getBody());
const businesses = JSON.parse(businessesRespond.getBody());

businessCategories.map(x => {
    x.businesses = businesses.filter(y => y.business_category == x.business_category);
});

console.log(businessCategories);

const schema = buildSchema(`
    type Query{
        businessCategories: [BusinessCategory],
        businesses: [Business],
        business(id: ID!): Business
    }

    type BusinessCategory{
        business_category: ID,
        count_1: Int,
        businesses: [Business]
    }

    type Business{
        business_category: ID,
        trade_name: ID,
        externalid: ID,
        address: String,
        status: String,
        date_of_issue: String,
        expiry_date: String,
        neighbourhood_id: String,
        neighbourhood: String,
        ward: String,
        latitude: String,
        longitude: String,
        location: Location,
        count: String
    }

    type Location{
        latitude: String,
        longitude: String,
        human_address: String
    }
`);

const root = {
    businessCategories: args => {
        return businessCategories;
    },
    businesses: args => {
        return businesses;
    },
    business: args => {
        var business = businesses.filter(x => x.externalid == args.id)[0];
        return business;
    }

}

app.use(
    '/graphql',
    graphqlHTTP({
        schema,
        rootValue: root,
        graphiql:true
    }));

app.listen(4201, err => {
    if(err) return console.log(err);

    return console.log("GraphQL API is listening on port 4201");
})