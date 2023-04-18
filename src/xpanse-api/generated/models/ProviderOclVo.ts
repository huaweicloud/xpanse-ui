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

import { Region } from './Region';
import { UserAvailableServiceVo } from './UserAvailableServiceVo';

/**
 * List of the registered services group by service version.
 */
export class ProviderOclVo {
    /**
     * The Cloud Service Provider.
     */
    'name': ProviderOclVoNameEnum;
    /**
     * The regions of the Cloud Service Provider.
     */
    'regions': Array<Region>;
    /**
     * The list of the available services.
     */
    'details': Array<UserAvailableServiceVo>;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{ name: string; baseName: string; type: string; format: string }> = [
        {
            name: 'name',
            baseName: 'name',
            type: 'ProviderOclVoNameEnum',
            format: '',
        },
        {
            name: 'regions',
            baseName: 'regions',
            type: 'Array<Region>',
            format: '',
        },
        {
            name: 'details',
            baseName: 'details',
            type: 'Array<UserAvailableServiceVo>',
            format: '',
        },
    ];

    static getAttributeTypeMap() {
        return ProviderOclVo.attributeTypeMap;
    }

    public constructor() {}
}

export type ProviderOclVoNameEnum = 'aws' | 'azure' | 'alicloud' | 'huawei' | 'openstack' | 'flexibleEngine';
