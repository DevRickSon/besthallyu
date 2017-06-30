import mongoose from 'mongoose';
import crypto from 'crypto';

const Schema = mongoose.Schema;

const Admin = new Schema({
    id: String,
    password: String
});

Admin.statics.create = function(id, password){
    const encrypted = crypto.createHmac('sha1', 'seCrETeKeyOfheYFpW')
                            .update(password)
                            .digest('base64');

    const admin = new this({
        id,
        password: encrypted
    });

    return admin.save();
};

Admin.statics.findOneById = function(id){
    return this.findOne({
        id
    }).exec();
};

Admin.methods.verify = function(password){
    const encrypted = crypto.createHmac('sha1', 'seCrETeKeyOfheYFpW')
                            .update(password)
                            .digest('base64');

    return this.password === encrypted;
};

export default mongoose.model('Admin', Admin);
