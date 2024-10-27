/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'node:fs';
import * as xml2js from 'xml2js';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/plugin-generate', 'generate.fields');

export type GenerateResult = {
	// path: string;
	// encoding: string;
	// project: string;
	parsedCSV: string;
};

export default class Generate extends SfCommand<GenerateResult> {
	public static readonly summary = messages.getMessage('summary');
	public static readonly description = messages.getMessage('description');
	public static readonly examples = messages.getMessages('examples');

	public static readonly flags = {
		path: Flags.string({
			char: 'p',
			required: true,
			summary: messages.getMessage('flags.path.summary'),
			description: messages.getMessage('flags.path.description'),
		}),
		encoding: Flags.string({
			char: 'e',
			required: true,
			summary: messages.getMessage('flags.encoding.summary'),
			description: messages.getMessage('flags.encoding.description'),
		}),
		project: Flags.string({
			char: 's',
			required: true,
			summary: messages.getMessage('flags.project.summary'),
			description: messages.getMessage('flags.project.description'),
		}),
	};

	public async run(): Promise<GenerateResult> {
		const { flags } = await this.parse(Generate);
		const data = fs.readFileSync(flags.path, 'utf-8');

		// Split data into rows
		const rows = data
			.split('\n')
			.map((row) => row.trim())
			.filter(Boolean);

		this.log('Fields: ' + JSON.stringify(rows.length - 1));

		// Get columns from the first row (assuming CSV format)
		const columns: [keyof CustomField] = rows[0].split(',') as [keyof CustomField];

		const packageXML: Package = {
			$: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
			types: [],
			version: 51.0, // Should be flag value
		};

		const members: string[] = [];

		const types: PackageTypeMembers = {
			members: [],
			name: PackageTypeMemberNames.CustomField,
		};

		// Loop through the remaining rows (starting from the second row)
		for (let i = 1; i < rows.length; i++) {
			// CustomField xml structure as an object that we'll pass on to xml2js.builder
			const customField: CustomField = {
				$: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
			};

			const builder = new xml2js.Builder();

			let sobject: string = '';

			let defaultValue: string = '';

			const rowValues: CustomFieldType[] = rows[i].split(','); // Split each row into values

			// Assign each value to the corresponding column in the customFieldXML
			for (let j = 0; j < columns.length; j++) {
				const columnName: keyof CustomField = columns[j];

				const rowValue: CustomFieldType = rowValues[j];

				if (columnName === 'sObject') {
					sobject = rowValue as string;
					continue;
				}

				if (!(rowValue === '')) {
					if (columnName === 'valueSet') {
						const stringRowValue: string = rowValue as string;

						const restricted: boolean = stringRowValue.split('<')[0].toLowerCase() === 'true';
						const sorted: boolean = stringRowValue.split('<')[1].toLowerCase() === 'true';

						const valueSetDefinition: ValueSetDefinition = {
							sorted,
							value: [],
						};

						const valueSet: ValueSet = {
							restricted,
							valueSetDefinition,
						};

						defaultValue = stringRowValue.split('<')[2];

						for (const labelAPIPair of stringRowValue.split('<')[3].split(';')) {
							const value: Value = {
								fullName: labelAPIPair.split('|')[1],
								default: false,
								label: labelAPIPair.split('|')[0],
							};

							if (defaultValue === value.fullName) {
								value.default = true;
							}

							valueSet.valueSetDefinition.value.push(value);
						}

						customField[columnName] = valueSet;
					} else {
						customField[columnName] = rowValue as undefined;
					}
				}
			}

			members.push(sobject + '.' + customField.fullName);

			types.members = members;

			const xml = builder.buildObject({ CustomField: customField });

			fs.mkdirSync(flags.project + '\\force-app\\main\\default\\objects\\' + sobject + '\\fields', {
				recursive: true,
			});
			fs.writeFileSync(
				flags.project +
					'\\force-app\\main\\default\\objects\\' +
					sobject +
					'\\fields\\' +
					customField.fullName +
					'.field-meta.xml',
				xml
			);
		}

		packageXML.types.push(types);

		const builder = new xml2js.Builder();
		const xml = builder.buildObject({ Package: packageXML });

		fs.mkdirSync(flags.project + '\\manifest\\', { recursive: true });
		fs.writeFileSync(flags.project + '\\manifest\\' + 'generated_package.xml', xml);

		this.log(messages.getMessage('info.fields', [flags.path, flags.encoding, flags.project]));
		return {
			parsedCSV: data,
			// path: flags.path,
			// encoding: flags.encoding,
		};
	}
}

// ?-----------------------------------------------------------------------------------------------//
// ?                                          CUSTOM FIELD                                         //
// ?                                         (CustomField)                                         //
// ?-----------------------------------------------------------------------------------------------//
/*
type CustomField = {
	[propName: string]: unknown;
};
*/

type CustomFieldType = CustomField[keyof CustomField];

type CustomField = {
	$?: $;
	businessOwnerGroup?: string;
	businessOwnerUser?: string;
	businessStatus?: BusinessStatus;
	caseSensitive?: boolean;
	complianceGroup?: ComplianceGroup[];
	customDataType?: string;
	defaultValue?: string;
	deleteConstraint?: DeleteConstraint;
	deprecated?: boolean;
	description?: string;
	displayFormat?: string;
	displayLocationInDecimal?: boolean;
	elementType?: string;
	encrypted?: boolean;
	encryptionScheme?: EncryptionScheme;
	externalDeveloperName?: string;
	externalId?: boolean;
	fieldManageability?: FieldManageability;
	formula?: string;
	formulaTreatBlanksAs?: FormulaTreatBlanksAs;
	fullName?: string;
	globalPicklist?: string;
	indexed?: boolean;
	inlineHelpText?: string;
	isAIPredictionField?: boolean;
	isFilteringDisabled?: boolean;
	isNameField?: boolean;
	isSortingDisabled?: boolean;
	label?: string;
	length?: number;
	lookupFilter?: LookupFilter;
	maskChar?: EncryptedFieldMaskChar;
	maskType?: EncryptedFieldMaskType;
	metadataRelationshipControllingField?: string;
	// picklist?: any;
	// (Deprecated. Use this field in API version 37.0 and earlier only. In later versions, use valueSet instead.)
	populateExistingRows?: boolean;
	precision?: number;
	referenceTargetField?: string;
	referenceTo?: string;
	relationshipLabel?: string;
	relationshipName?: string;
	relationshipOrder?: number;
	reparentableMasterDetail?: boolean;
	required?: boolean;
	scale?: number;
	securityClassification?: SecurityClassification;
	sObject?: string;
	startingNumber?: number;
	stripMarkup?: boolean;
	summarizedField?: string;
	summaryFilterItems?: FilterItem[];
	summaryForeignKey?: string;
	summaryOperation?: SummaryOperations;
	trackFeedHistory?: boolean;
	trackHistory?: boolean;
	trackTrending?: boolean;
	trueValueIndexed?: boolean;
	type?: FieldType;
	unique?: boolean;
	valueSet?: ValueSet;
	visibleLines?: number;
	writeRequiresMasterRead?: boolean;
};

enum BusinessStatus {
	Active = 'Active',
	DeprecateCandidate = 'DeprecateCandidate',
	Hidden = 'Hidden',
}

enum ComplianceGroup {
	CCPA = 'CCPA',
	COPPA = 'COPPA',
	GDPR = 'GDPR',
	HIPAA = 'HIPAA',
	PCI = 'PCI',
	PII = 'PII',
}

enum DeleteConstraint {
	Cascade = 'Cascade',
	Restrict = 'Restrict',
	SetNull = 'SetNull',
}

enum EncryptionScheme {
	CaseInsensitiveDeterministicEncryption = 'CaseInsensitiveDeterministicEncryption',
	CaseSensitiveDeterministicEncryption = 'CaseSensitiveDeterministicEncryption',
	None = 'None',
	ProbabilisticEncryption = 'ProbabilisticEncryption',
}

enum FieldManageability {
	Locked = 'Locked',
	DeveloperControlled = 'DeveloperControlled',
	SubscriberControlled = 'SubscriberControlled',
}

enum FormulaTreatBlanksAs {
	BlankAsBlank = 'BlankAsBlank',
	BlankAsZero = 'BlankAsZero',
}

type LookupFilter = {
	active?: boolean;
	booleanFilter?: string;
	description?: string;
	errorMessage?: string;
	filterItems?: FilterItem[];
	infoMessage?: string;
	isOptional?: boolean;
};

enum FilterOperation {
	equals = 'equals',
	notEqual = 'notEqual',
	lessThan = 'lessThan',
	greaterThan = 'greaterThan',
	lessOrEqual = 'lessOrEqual',
	greaterOrEqual = 'greaterOrEqual',
	contains = 'contains',
	notContain = 'notContain',
	startsWith = 'startsWith',
	includes = 'includes',
	excludes = 'excludes',
	within = 'within',
}

type FilterItem = {
	field?: string;
	operation?: FilterOperation;
	value?: string;
	valueField?: string;
};

enum EncryptedFieldMaskChar {
	asterisk = 'asterisk',
	X = 'X',
}

enum EncryptedFieldMaskType {
	all = 'all',
	creditCard = 'creditCard',
	lastFour = 'lastFour',
	nino = 'nino',
	sin = 'sin',
	ssn = 'ssn',
}

enum SecurityClassification {
	Public = 'Public',
	Internal = 'Internal',
	Confidential = 'Confidential',
	Restricted = 'Restricted',
	MissionCritical = 'MissionCritical',
}

enum SummaryOperations {
	Count = 'Count',
	Min = 'Min',
	Max = 'Max',
	Sum = 'Sum',
}

enum FieldType {
	Address = 'Address',
	AutoNumber = 'AutoNumber',
	Lookup = 'Lookup',
	MasterDetail = 'MasterDetail',
	MetadataRelationship = 'MetadataRelationship',
	Checkbox = 'Checkbox',
	Currency = 'Currency',
	Date = 'Date',
	DateTime = 'DateTime',
	Email = 'Email',
	EncryptedText = 'EncryptedText',
	Note = 'Note',
	ExternalLookup = 'ExternalLookup',
	IndirectLookup = 'IndirectLookup',
	Number1 = 'Number1',
	Percent = 'Percent',
	Phone = 'Phone',
	Picklist = 'Picklist',
	MultiselectPicklist = 'MultiselectPicklist',
	Summary = 'Summary',
	Text = 'Text',
	TextArea = 'TextArea',
	LongTextArea = 'LongTextArea',
	Url = 'Url',
	Hierarchy = 'Hierarchy',
	File = 'File',
	Html = 'Html',
	Location = 'Location',
	Time = 'Time',
}

// ?-----------------------------------------------------------------------------------------------//
// ?                                          VALUESET                                             //
// ?                                         (ValueSet)                                            //
// ?-----------------------------------------------------------------------------------------------//

type Value = {
	fullName: string;
	default: boolean;
	label: string;
};

type ValueSet = {
	restricted: boolean;
	valueSetDefinition: ValueSetDefinition;
};

type ValueSetDefinition = {
	sorted: boolean;
	value: Value[];
};

// ?-----------------------------------------------------------------------------------------------//
// ?                                          PACKAGE                                              //
// ?                                         (Package)                                             //
// ?-----------------------------------------------------------------------------------------------//

type Package = {
	$: $;
	types: PackageTypeMembers[];
	version: number;
};

type PackageTypeMembers = {
	members: string[];
	name: PackageTypeMemberNames;
};

enum PackageTypeMemberNames {
	CustomField = 'CustomField',
}

// ?-----------------------------------------------------------------------------------------------//
// ?                                          GENERICS                                             //
// ?                                                                                               //
// ?-----------------------------------------------------------------------------------------------//

type $ = {
	xmlns: string;
};
