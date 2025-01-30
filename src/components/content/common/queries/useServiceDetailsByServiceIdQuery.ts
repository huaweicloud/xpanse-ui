/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { useQuery } from '@tanstack/react-query';
import {
    getSelfHostedServiceDetailsById,
    GetSelfHostedServiceDetailsByIdData,
    getVendorHostedServiceDetailsById,
    GetVendorHostedServiceDetailsByIdData,
    serviceHostingType,
    taskStatus,
} from '../../../../xpanse-api/generated';

const GET_SERVICE_DETAILS_QUERY_ID = 'getServiceDetailsById';

export function useServiceDetailsByServiceIdQuery(
    serviceId: string | undefined,
    currentServiceHostingType: string,
    currentServiceOrderTaskStatus: string | undefined
) {
    return useQuery({
        queryKey: [GET_SERVICE_DETAILS_QUERY_ID, serviceId, currentServiceHostingType],
        queryFn: () => {
            if (currentServiceHostingType === serviceHostingType.SELF.toString()) {
                const data: GetSelfHostedServiceDetailsByIdData = {
                    serviceId: serviceId ?? '',
                };
                return getSelfHostedServiceDetailsById(data);
            } else {
                const data: GetVendorHostedServiceDetailsByIdData = {
                    serviceId: serviceId ?? '',
                };
                return getVendorHostedServiceDetailsById(data);
            }
        },
        enabled:
            serviceId !== undefined &&
            (currentServiceOrderTaskStatus === taskStatus.SUCCESSFUL ||
                currentServiceOrderTaskStatus === taskStatus.FAILED),
        staleTime: Infinity,
        gcTime: Infinity,
    });
}

export function getQueryKeyForServiceDetailsByServiceIdQuery(
    serviceId: string,
    currentServiceHostingType: string
): string[] {
    return [GET_SERVICE_DETAILS_QUERY_ID, serviceId, currentServiceHostingType];
}
