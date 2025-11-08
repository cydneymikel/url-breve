import mongoose from 'mongoose';

import config from '../../util/env.js';
import logger from '../../util/logger.js';

/**
 * Mongoose Schemas
 */
const shortenSchema = new mongoose.Schema(
    {
        short: {
            type: String,
            required: true,
            unique: true,
            maxLength: 10
        },
        original: {
            type: String,
            required: true
        },
        alias: {
            type: String,
            unique: true,
            sparse: true,
            maxLength: 50
        },
        expires: {
            type: Date,
            default: null
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: { createdAt: 'created', updatedAt: false } }
);

const clickSchema = new mongoose.Schema(
    {
        urlId: {
            type: String,
            required: true,
            index: true
        }
    },
    { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

/**
 * MongoDB Database Adapter
 */
class MongoDBAdapter {
    constructor() {
        this.connection = null;
        this.models = {
            Shorten: mongoose.models.Shorten || mongoose.model('Shorten', shortenSchema),
            Click: mongoose.models.Click || mongoose.model('Click', clickSchema)
        };
    }

    async connect() {
        try {
            this.connection = await mongoose.connect(config.databaseUrl, { serverSelectionTimeoutMS: 5000 });
            logger.info('Database connected successfully (MongoDB)');
        } catch (error) {
            logger.error({ err: error }, 'MongoDB connection failed');
            throw error;
        }
    }

    async disconnect() {
        await mongoose.disconnect();
        logger.info('Database disconnected');
    }

    async createUrl({ short, original, alias = null, expires = null }) {
        const url = await this.models.Shorten.create({ short, original, alias, expires });
        return this._formatDoc(url.toObject());
    }

    async findUrlForRedirect(short) {
        const url = await this.models.Shorten.findOne({ short }).lean();
        return url ? this._formatDoc(url) : null;
    }

    async shortCodeExists(short) {
        return !!(await this.models.Shorten.exists({ short }));
    }

    async aliasExists(alias) {
        return !!(await this.models.Shorten.exists({ alias }));
    }

    async recordClick(urlId) {
        const click = await this.models.Click.create({ urlId });
        return { id: click._id.toString(), urlId: click.urlId, timestamp: click.timestamp };
    }

    async shortenCount() {
        return this.models.Shorten.countDocuments();
    }

    async clickCount() {
        return this.models.Click.countDocuments();
    }

    /** Private helper to format output */
    _formatDoc(doc) {
        return {
            id: doc._id.toString(),
            short: doc.short,
            original: doc.original,
            alias: doc.alias,
            created: doc.created,
            expires: doc.expires,
            active: doc.active
        };
    }
}

export default MongoDBAdapter;
