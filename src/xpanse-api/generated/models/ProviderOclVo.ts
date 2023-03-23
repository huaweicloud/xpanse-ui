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

import { Area } from './Area';
import { OclDetailVo } from './OclDetailVo';
import { HttpFile } from '../http/http';

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
    'areas': Array<Area>;
    /**
     * The list of the registered services.
     */
    'details': Array<OclDetailVo>;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{ name: string; baseName: string; type: string; format: string }> = [
        {
            name: 'name',
            baseName: 'name',
            type: 'ProviderOclVoNameEnum',
            format: '',
        },
        {
            name: 'areas',
            baseName: 'areas',
            type: 'Array<Area>',
            format: '',
        },
        {
            name: 'details',
            baseName: 'details',
            type: 'Array<OclDetailVo>',
            format: '',
        },
    ];

    static getAttributeTypeMap() {
        return ProviderOclVo.attributeTypeMap;
    }

    public constructor() {}
}

export type ProviderOclVoNameEnum = 'aws' | 'azure' | 'alibaba' | 'huawei' | 'openstack';
