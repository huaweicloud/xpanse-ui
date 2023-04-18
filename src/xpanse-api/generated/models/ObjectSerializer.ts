/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

export * from './Billing';
export * from './CategoryOclVo';
export * from './CloudServiceProvider';
export * from './CreateRequest';
export * from './DeployResource';
export * from './DeployVariable';
export * from './DeployVariableKind';
export * from './Deployment';
export * from './Flavor';
export * from './Link';
export * from './Ocl';
export * from './ProviderOclVo';
export * from './Region';
export * from './RegisteredServiceVo';
export * from './Response';
export * from './ServiceDetailVo';
export * from './ServiceVo';
export * from './SystemStatus';
export * from './UserAvailableServiceVo';
export * from './VersionOclVo';

import { Billing, BillingCurrencyEnum, BillingPeriodEnum } from './Billing';
import { CategoryOclVo } from './CategoryOclVo';
import { CloudServiceProvider, CloudServiceProviderNameEnum } from './CloudServiceProvider';
import { CreateRequest, CreateRequestCategoryEnum, CreateRequestCspEnum } from './CreateRequest';
import { DeployResource, DeployResourceKindEnum } from './DeployResource';
import { DeployVariable, DeployVariableDataTypeEnum } from './DeployVariable';
import { DeployVariableKind } from './DeployVariableKind';
import { Deployment, DeploymentKindEnum } from './Deployment';
import { Flavor } from './Flavor';
import { Link } from './Link';
import { Ocl, OclCategoryEnum } from './Ocl';
import { ProviderOclVo, ProviderOclVoNameEnum } from './ProviderOclVo';
import { Region } from './Region';
import {
    RegisteredServiceVo,
    RegisteredServiceVoCategoryEnum,
    RegisteredServiceVoCspEnum,
    RegisteredServiceVoServiceStateEnum,
} from './RegisteredServiceVo';
import { Response, ResponseResultTypeEnum } from './Response';
import {
    ServiceDetailVo,
    ServiceDetailVoCategoryEnum,
    ServiceDetailVoCspEnum,
    ServiceDetailVoServiceStateEnum,
} from './ServiceDetailVo';
import { ServiceVo, ServiceVoCategoryEnum, ServiceVoCspEnum, ServiceVoServiceStateEnum } from './ServiceVo';
import { SystemStatus, SystemStatusHealthStatusEnum } from './SystemStatus';
import {
    UserAvailableServiceVo,
    UserAvailableServiceVoCategoryEnum,
    UserAvailableServiceVoCspEnum,
    UserAvailableServiceVoServiceStateEnum,
} from './UserAvailableServiceVo';
import { VersionOclVo } from './VersionOclVo';
import YAML from 'yaml';

/* tslint:disable:no-unused-variable */
let primitives = ['string', 'boolean', 'double', 'integer', 'long', 'float', 'number', 'any'];

const supportedMediaTypes: { [mediaType: string]: number } = {
    'application/json': Infinity,
    'application/octet-stream': 0,
    'application/x-www-form-urlencoded': 0,
    'application/x-yaml': 0,
};

let enumsMap: Set<string> = new Set<string>([
    'BillingPeriodEnum',
    'BillingCurrencyEnum',
    'CloudServiceProviderNameEnum',
    'CreateRequestCategoryEnum',
    'CreateRequestCspEnum',
    'DeployResourceKindEnum',
    'DeployVariableDataTypeEnum',
    'DeployVariableKind',
    'DeploymentKindEnum',
    'OclCategoryEnum',
    'ProviderOclVoNameEnum',
    'RegisteredServiceVoCspEnum',
    'RegisteredServiceVoCategoryEnum',
    'RegisteredServiceVoServiceStateEnum',
    'ResponseResultTypeEnum',
    'ServiceDetailVoCategoryEnum',
    'ServiceDetailVoCspEnum',
    'ServiceDetailVoServiceStateEnum',
    'ServiceVoCategoryEnum',
    'ServiceVoCspEnum',
    'ServiceVoServiceStateEnum',
    'SystemStatusHealthStatusEnum',
    'UserAvailableServiceVoCategoryEnum',
    'UserAvailableServiceVoCspEnum',
    'UserAvailableServiceVoServiceStateEnum',
]);

let typeMap: { [index: string]: any } = {
    Billing: Billing,
    CategoryOclVo: CategoryOclVo,
    CloudServiceProvider: CloudServiceProvider,
    CreateRequest: CreateRequest,
    DeployResource: DeployResource,
    DeployVariable: DeployVariable,
    Deployment: Deployment,
    Flavor: Flavor,
    Link: Link,
    Ocl: Ocl,
    ProviderOclVo: ProviderOclVo,
    Region: Region,
    RegisteredServiceVo: RegisteredServiceVo,
    Response: Response,
    ServiceDetailVo: ServiceDetailVo,
    ServiceVo: ServiceVo,
    SystemStatus: SystemStatus,
    UserAvailableServiceVo: UserAvailableServiceVo,
    VersionOclVo: VersionOclVo,
};

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === 'Date') {
            return expectedType;
        } else {
            if (enumsMap.has(expectedType)) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if (typeMap[discriminatorType]) {
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string, format: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf('Array<', 0) === 0) {
            // string.startsWith pre es6
            let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index in data) {
                let date = data[index];
                transformedData.push(ObjectSerializer.serialize(date, subType, format));
            }
            return transformedData;
        } else if (type === 'Date') {
            if (format == 'date') {
                let month = data.getMonth() + 1;
                month = month < 10 ? '0' + month.toString() : month.toString();
                let day = data.getDate();
                day = day < 10 ? '0' + day.toString() : day.toString();

                return data.getFullYear() + '-' + month + '-' + day;
            } else {
                return data.toISOString();
            }
        } else {
            if (enumsMap.has(type)) {
                return data;
            }
            if (!typeMap[type]) {
                // in case we dont know the type
                return data;
            }

            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: { [index: string]: any } = {};
            for (let index in attributeTypes) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(
                    data[attributeType.name],
                    attributeType.type,
                    attributeType.format
                );
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string, format: string) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf('Array<', 0) === 0) {
            // string.startsWith pre es6
            let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index in data) {
                let date = data[index];
                transformedData.push(ObjectSerializer.deserialize(date, subType, format));
            }
            return transformedData;
        } else if (type === 'Date') {
            return new Date(data);
        } else {
            if (enumsMap.has(type)) {
                // is Enum
                return data;
            }

            if (!typeMap[type]) {
                // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index in attributeTypes) {
                let attributeType = attributeTypes[index];
                let value = ObjectSerializer.deserialize(
                    data[attributeType.baseName],
                    attributeType.type,
                    attributeType.format
                );
                if (value !== undefined) {
                    instance[attributeType.name] = value;
                }
            }
            return instance;
        }
    }

    /**
     * Normalize media type
     *
     * We currently do not handle any media types attributes, i.e. anything
     * after a semicolon. All content is assumed to be UTF-8 compatible.
     */
    public static normalizeMediaType(mediaType: string | undefined): string | undefined {
        if (mediaType === undefined) {
            return undefined;
        }
        return mediaType.split(';')[0].trim().toLowerCase();
    }

    /**
     * From a list of possible media types, choose the one we can handle best.
     *
     * The order of the given media types does not have any impact on the choice
     * made.
     */
    public static getPreferredMediaType(mediaTypes: Array<string>): string {
        /** According to OAS 3 we should default to json */
        if (!mediaTypes) {
            return 'application/json';
        }

        const normalMediaTypes = mediaTypes.map(this.normalizeMediaType);
        let selectedMediaType: string | undefined = undefined;
        let selectedRank: number = -Infinity;
        for (const mediaType of normalMediaTypes) {
            if (supportedMediaTypes[mediaType!] > selectedRank) {
                selectedMediaType = mediaType;
                selectedRank = supportedMediaTypes[mediaType!];
            }
        }

        if (selectedMediaType === undefined) {
            throw new Error('None of the given media types are supported: ' + mediaTypes.join(', '));
        }

        return selectedMediaType!;
    }

    /**
     * Convert data to a string according the given media type
     */
    public static stringify(data: any, mediaType: string): string {
        if (mediaType === 'text/plain') {
            return String(data);
        }

        if (mediaType === 'application/json') {
            return JSON.stringify(data);
        }

        if (mediaType === 'application/x-yaml') {
            return YAML.stringify(data);
        }

        throw new Error('The mediaType ' + mediaType + ' is not supported by ObjectSerializer.stringify.');
    }

    /**
     * Parse data from a string according to the given media type
     */
    public static parse(rawData: string, mediaType: string | undefined) {
        if (mediaType === undefined) {
            throw new Error('Cannot parse content. No Content-Type defined.');
        }

        if (mediaType === 'text/plain') {
            return rawData;
        }

        if (mediaType === 'application/json') {
            return JSON.parse(rawData);
        }

        if (mediaType === 'text/html') {
            return rawData;
        }

        if (mediaType === 'application/yaml') {
            return YAML.parse(rawData);
        }

        throw new Error('The mediaType ' + mediaType + ' is not supported by ObjectSerializer.parse.');
    }
}
