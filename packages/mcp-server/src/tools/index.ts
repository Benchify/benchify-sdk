// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { Metadata, Endpoint, HandlerFunction } from './types';

export { Metadata, Endpoint, HandlerFunction };

import run_fixer from './fixer/run-fixer';
import create_stacks from './stacks/create-stacks';
import retrieve_stacks from './stacks/retrieve-stacks';
import update_stacks from './stacks/update-stacks';
import create_and_run_stacks from './stacks/create-and-run-stacks';
import destroy_stacks from './stacks/destroy-stacks';
import execute_command_stacks from './stacks/execute-command-stacks';
import get_logs_stacks from './stacks/get-logs-stacks';
import get_network_info_stacks from './stacks/get-network-info-stacks';
import create_fix_string_literals from './fix-string-literals/create-fix-string-literals';
import validate_validate_template from './validate-template/validate-validate-template';

import create_sandboxes from './sandboxes/create-sandboxes';
import retrieve_sandboxes from './sandboxes/retrieve-sandboxes';
import update_sandboxes from './sandboxes/update-sandboxes';
import delete_sandboxes from './sandboxes/delete-sandboxes';
import run_fix_local from './fixer/run-fix-local';

export const endpoints: Endpoint[] = [];

function addEndpoint(endpoint: Endpoint) {
  endpoints.push(endpoint);
}

addEndpoint(run_fixer);
addEndpoint(create_stacks);
addEndpoint(retrieve_stacks);
addEndpoint(update_stacks);
addEndpoint(create_and_run_stacks);
addEndpoint(destroy_stacks);
addEndpoint(execute_command_stacks);
addEndpoint(get_logs_stacks);
addEndpoint(get_network_info_stacks);
addEndpoint(create_fix_string_literals);
addEndpoint(validate_validate_template);

export type Filter = {
  type: 'resource' | 'operation' | 'tag' | 'tool';
  op: 'include' | 'exclude';
  value: string;
};

export function query(filters: Filter[], endpoints: Endpoint[]): Endpoint[] {
  const allExcludes = filters.length > 0 && filters.every((filter) => filter.op === 'exclude');
  const unmatchedFilters = new Set(filters);

  const filtered = endpoints.filter((endpoint: Endpoint) => {
    let included = false || allExcludes;

    for (const filter of filters) {
      if (match(filter, endpoint)) {
        unmatchedFilters.delete(filter);
        included = filter.op === 'include';
      }
    }

    return included;
  });

  // Check if any filters didn't match
  const unmatched = Array.from(unmatchedFilters).filter((f) => f.type === 'tool' || f.type === 'resource');
  if (unmatched.length > 0) {
    throw new Error(
      `The following filters did not match any endpoints: ${unmatched
        .map((f) => `${f.type}=${f.value}`)
        .join(', ')}`,
    );
  }

  return filtered;
}

function match({ type, value }: Filter, endpoint: Endpoint): boolean {
  switch (type) {
    case 'resource': {
      const regexStr = '^' + normalizeResource(value).replace(/\*/g, '.*') + '$';
      const regex = new RegExp(regexStr);
      return regex.test(normalizeResource(endpoint.metadata.resource));
    }
    case 'operation':
      return endpoint.metadata.operation === value;
    case 'tag':
      return endpoint.metadata.tags.includes(value);
    case 'tool':
      return endpoint.tool.name === value;
  }
}

function normalizeResource(resource: string): string {
  return resource.toLowerCase().replace(/[^a-z.*\-_]*/g, '');
}
