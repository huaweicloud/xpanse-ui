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

import { HttpFile } from '../http/http';

/**
 * The area of the regions
 */
export class Area {
    /**
     * The name of the area
     */
    'name': string;
    /**
     * The regions of the area
     */
    'regions': Array<string>;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{ name: string; baseName: string; type: string; format: string }> = [
        {
            name: 'name',
            baseName: 'name',
            type: 'string',
            format: '',
        },
        {
            name: 'regions',
            baseName: 'regions',
            type: 'Array<string>',
            format: '',
        },
    ];

    static getAttributeTypeMap() {
        return Area.attributeTypeMap;
    }

    public constructor() {}
}
