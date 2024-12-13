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

// this "Result" is used in the test files for the command
export type GenerateResult = {
	// path: string;
	// encoding: string;
	// project: string;
	parsedCSV: CustomField[];
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

		const customFields: CustomField[] = parse<CustomField>(fs.readFileSync(flags.path, 'utf-8'));

		const members: string[] = feedCustomFieldMetadata(
			JSON.parse(JSON.stringify(customFields)) as CustomField[],
			flags.project
		);

		feedPackage(members, PackageTypeMemberNames.CustomField, flags.project);

		this.log(messages.getMessage('info.fields', [flags.path, flags.encoding, flags.project]));
		return {
			parsedCSV: customFields,
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

// TODO run validations when mdObject is of type CustomField.(ask for certain columns depending on field type)
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
	sobject?: string;
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

enum TypesToParse {
	valueSet = 'valueSet',
}

// ?-----------------------------------------------------------------------------------------------//
// ?                                          FUNCTIONS                                            //
// ?                                                                                               //
// ?-----------------------------------------------------------------------------------------------//

export function parse<mdType>(data: string): mdType[] {
	// TODO check if headers is in list of keyof types
	const headers: string[] = data.split('\r')[0].split(';');

	headers.forEach((header) => {
		header.trim();
	});

	const rows: string[] = data.split('\r\n').slice(1, data.split('\r').length - 2);

	const mdObjectList: mdType[] = [] as mdType[];

	for (const [i, row] of rows.entries()) {
		const mdObject: mdType = {} as mdType;

		mdObject['$' as keyof mdType] = { xmlns: 'http://soap.sforce.com/2006/04/metadata' } as mdType[keyof mdType];

		for (const [j, value] of row.split(';').entries()) {
			const header: keyof mdType = headers[j].trim() as keyof mdType;

			// TODO Enum should be used instead of 'valueSet' so it bypasses certain types.
			// TODO That is going to give the opportunity to call for the right function outside of the loop.
			// TODO In the meantime cast those values as strings.
			if (value) {
				try {
					if (!(header in TypesToParse)) {
						mdObject[header] = value.trim() as mdType[keyof mdType];
					} else if (header in TypesToParse) {
						const formattedJSON: string = value
							.replaceAll('""', '?')
							.replaceAll('"', '')
							.replaceAll('?', '"');

						mdObject[header] = JSON.parse(formattedJSON) as mdType[keyof mdType];
					}
				} catch (e) {
					// TODO store error messages with codes an such
					throw new Error(
						`There is an unresolved issue with the value at index ${i + 2}, column ${header as string} → ${
							e as string
						}`
					);
				}
			}
		}

		mdObjectList.push(mdObject);
	}

	return mdObjectList;
}

export function feedCustomFieldMetadata(customFields: CustomField[], project: string): string[] {
	const memberNames: string[] = [];

	for (const customField of customFields) {
		// Check sobject from customField here since now its a optional attribute. If it's null then throw error. Index could also be stored in the table to help the user.

		const sObject: string = customField.sobject as string;

		delete customField.sobject;

		const builder = new xml2js.Builder();

		memberNames.push(sObject + '.' + customField.fullName);

		const xml = builder.buildObject({ CustomField: customField });

		fs.mkdirSync(project + '\\force-app\\main\\default\\objects\\' + sObject + '\\fields', { recursive: true });
		fs.writeFileSync(
			project +
				'\\force-app\\main\\default\\objects\\' +
				sObject +
				'\\fields\\' +
				customField.fullName +
				'.field-meta.xml',
			xml
		);
	}

	return memberNames;
}

export function feedPackage(members: string[], packageTypeMemberName: PackageTypeMemberNames, project: string): void {
	const packageXML: Package = {
		$: { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
		types: [
			{
				members,
				name: packageTypeMemberName,
			},
		],
		version: 62.0, // Should be flag value
	};

	fs.mkdirSync(project + '\\manifest\\', { recursive: true });
	fs.writeFileSync(
		project + '\\manifest\\' + 'generated_package.xml',
		new xml2js.Builder().buildObject({ Package: packageXML })
	);
}
