/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Ocl } from '../models/Ocl';
import type { Response } from '../models/Response';
import type { ServiceTemplateVo } from '../models/ServiceTemplateVo';
import type { UserAvailableServiceVo } from '../models/UserAvailableServiceVo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ServiceVendorService {
    /**
     * Get service template using id.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param id id of service template
     * @returns ServiceTemplateVo OK
     * @throws ApiError
     */
    public static details(id: string): CancelablePromise<ServiceTemplateVo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/xpanse/service_templates/{id}',
            path: {
                id: id,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }

    /**
     * Update service template using id and ocl model.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param id id of service template
     * @param requestBody
     * @returns ServiceTemplateVo OK
     * @throws ApiError
     */
    public static update(id: string, requestBody: Ocl): CancelablePromise<ServiceTemplateVo> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/xpanse/service_templates/{id}',
            path: {
                id: id,
            },
            body: requestBody,
            mediaType: 'application/x-yaml',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }

    /**
     * Delete service template using id.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param id id of service template
     * @returns Response OK
     * @throws ApiError
     */
    public static unregister(id: string): CancelablePromise<Response> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/xpanse/service_templates/{id}',
            path: {
                id: id,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }

    /**
     * Update service template using id and URL of Ocl file.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param id id of service template
     * @param oclLocation URL of Ocl file
     * @returns ServiceTemplateVo OK
     * @throws ApiError
     */
    public static fetchUpdate(id: string, oclLocation: string): CancelablePromise<ServiceTemplateVo> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/xpanse/service_templates/file/{id}',
            path: {
                id: id,
            },
            query: {
                oclLocation: oclLocation,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }

    /**
     * List service templates with query params.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param categoryName category of the service
     * @param cspName name of the cloud service provider
     * @param serviceName name of the service
     * @param serviceVersion version of the service
     * @returns UserAvailableServiceVo OK
     * @throws ApiError
     */
    public static listServiceTemplates(
        categoryName?:
            | 'ai'
            | 'compute'
            | 'container'
            | 'storage'
            | 'network'
            | 'database'
            | 'mediaService'
            | 'security'
            | 'middleware'
            | 'others',
        cspName?: 'huawei' | 'flexibleEngine' | 'openstack' | 'alicloud' | 'aws' | 'azure' | 'google' | 'scs',
        serviceName?: string,
        serviceVersion?: string
    ): CancelablePromise<Array<UserAvailableServiceVo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/xpanse/service_templates',
            query: {
                categoryName: categoryName,
                cspName: cspName,
                serviceName: serviceName,
                serviceVersion: serviceVersion,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }

    /**
     * Register new service template using ocl model.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param requestBody
     * @returns ServiceTemplateVo OK
     * @throws ApiError
     */
    public static register(requestBody: Ocl): CancelablePromise<ServiceTemplateVo> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/xpanse/service_templates',
            body: requestBody,
            mediaType: 'application/x-yaml',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }

    /**
     * Register new service template using URL of Ocl file.<br>Required role:<b> admin</b> or <b>isv</b>
     * @param oclLocation URL of Ocl file
     * @returns ServiceTemplateVo OK
     * @throws ApiError
     */
    public static fetch(oclLocation: string): CancelablePromise<ServiceTemplateVo> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/xpanse/service_templates/file',
            query: {
                oclLocation: oclLocation,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
                502: `Bad Gateway`,
            },
        });
    }
}
