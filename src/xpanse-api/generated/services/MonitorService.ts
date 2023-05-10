/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Metric } from '../models/Metric';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MonitorService {
    /**
     * Get Monitor metric of the deployed service
     * @param id Id of the deployed service
     * @returns Metric OK
     * @throws ApiError
     */
    public static getMetrics(id: string): CancelablePromise<Array<Metric>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/xpanse/monitor/metric',
            query: {
                id: id,
            },
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
            },
        });
    }
}
