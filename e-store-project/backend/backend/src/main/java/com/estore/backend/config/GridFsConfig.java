package com.estore.backend.config;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;

@Configuration
public class GridFsConfig {

    @Bean
    public GridFSBucket gridFsBucket(MongoDatabaseFactory mongoDbFactory) {
        return GridFSBuckets.create(mongoDbFactory.getMongoDatabase());
    }
}

