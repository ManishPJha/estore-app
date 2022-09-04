module.exports = class ApiFeatures {

    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    search(){
        const keyword = this.queryString.keyword ? {
            productName: {
                $regex: new RegExp(this.queryString.keyword, 'i'),
            }
        } : {}    

        this.query = this.query.find({ ...keyword });

        return  this;
    }

    filter(){
        const queryCopy = { ...this.queryString };

        // Removing fields from the query
        const removeFields = [
            'keyword',
            'limit',
            'page'
        ];

        // Advance filter for price, ratings etc
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

        removeFields.forEach(el => delete queryCopy[el]);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;

    }

    pagination(perPageItem){
        const currentPage = Number(this.queryString.page) || 1;
        const skip = perPageItem * (currentPage - 1);

        this.query = this.query.limit(perPageItem).skip(skip);

        return this;
    }

}