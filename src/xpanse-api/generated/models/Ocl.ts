/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

/**
 * OpenAPI definition
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: v0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Billing } from './Billing';
import { CloudServiceProvider } from './CloudServiceProvider';
import { Deployment } from './Deployment';
import { Flavor } from './Flavor';

export class Ocl {
    /**
    * The catalog of the service
    */
    'category': OclCategoryEnum;
    /**
    * The version of the Ocl
    */
    'version': string;
    /**
    * The name of the managed service
    */
    'name': string;
    /**
    * The version of the managed service
    */
    'serviceVersion': string;
    /**
    * The description of the managed service
    */
    'description': string;
    /**
    * The namespace of the managed service
    */
    'namespace': string;
    /**
    * The icon of the managed service
    */
    'icon': string;
    'cloudServiceProvider': CloudServiceProvider;
    'deployment': Deployment;
    /**
    * The flavors of the managed service
    */
    'flavors': Array<Flavor>;
    'billing': Billing;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{name: string, baseName: string, type: string, format: string}> = [
        {
            "name": "category",
            "baseName": "category",
            "type": "OclCategoryEnum",
            "format": ""
        },
        {
            "name": "version",
            "baseName": "version",
            "type": "string",
            "format": ""
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string",
            "format": ""
        },
        {
            "name": "serviceVersion",
            "baseName": "serviceVersion",
            "type": "string",
            "format": ""
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string",
            "format": ""
        },
        {
            "name": "namespace",
            "baseName": "namespace",
            "type": "string",
            "format": ""
        },
        {
            "name": "icon",
            "baseName": "icon",
            "type": "string",
            "format": ""
        },
        {
            "name": "cloudServiceProvider",
            "baseName": "cloudServiceProvider",
            "type": "CloudServiceProvider",
            "format": ""
        },
        {
            "name": "deployment",
            "baseName": "deployment",
            "type": "Deployment",
            "format": ""
        },
        {
            "name": "flavors",
            "baseName": "flavors",
            "type": "Array<Flavor>",
            "format": ""
        },
        {
            "name": "billing",
            "baseName": "billing",
            "type": "Billing",
            "format": ""
        }    ];

    static getAttributeTypeMap() {
        return Ocl.attributeTypeMap;
    }

    public constructor() {
    }
}


export type OclCategoryEnum = "ai" | "compute" | "container" | "storage" | "network" | "database" | "media_service" | "security" | "middleware" | "others" ;

