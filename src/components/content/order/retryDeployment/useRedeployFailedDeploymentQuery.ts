/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    redeployFailedDeployment,
    RedeployFailedDeploymentData,
    serviceHostingType,
} from '../../../../xpanse-api/generated/';
import { getQueryKeyForServiceDetailsByServiceIdQuery } from '../../common/queries/useServiceDetailsByServiceIdQuery.ts';

export default function useRedeployFailedDeploymentQuery(serviceHostingType: serviceHostingType) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (serviceId: string) => {
            const data: RedeployFailedDeploymentData = { serviceId: serviceId };
            return redeployFailedDeployment(data);
        },
        onSuccess: (data) => {
            queryClient.removeQueries({
                queryKey: getQueryKeyForServiceDetailsByServiceIdQuery(data.serviceId, serviceHostingType),
            });
        },
    });
}
