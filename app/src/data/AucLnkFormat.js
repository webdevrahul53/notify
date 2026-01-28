const attributes = {
    Account_Name: { type: 'text', mandatory: true, key: 'non', editable: false },
    Account_Email: { type: 'text', mandatory: true, key: 'unique', editable: true },
    Date_Of_Birth: { type: 'dd-mm-yyyy', mandatory: true, key: 'non', editable: true },
    Phone_Number: { type: 'text', mandatory: true, key: 'non', editable: true },
    Employee_Code: { type: 'text', mandatory: false, key: 'non', editable: true },
    Location: { type: 'text', mandatory: false, key: 'non', editable: true },
    Anniversary_Date: { type: 'dd-mm-yyyy', mandatory: false, key: 'non', editable: true },
};

const AucLnkFormat = [
    Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.type])),
    // Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.mandatory ? 'mandatory' : 'optional'])),
    // Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.key === 'unique' ? 'unique key' : value.key === 'non' ? 'non key' : value.key])),
    // Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, value.editable ? 'editable' : 'noneditable']))
];

export default AucLnkFormat;