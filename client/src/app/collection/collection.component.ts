import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EJSON, ObjectId } from 'bson';
import {
  NzNotificationService,
  NzTreeHigherOrderServiceToken,
} from 'ng-zorro-antd';
import * as _ from 'lodash';

const Papa = require('papaparse');

interface simpleSearch {
  key: any;
  value: any;
  type: string;
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent implements OnInit {
  @Input() database: any;
  @Input() collection: any;
  data: any;
  filter = '';
  ejsonFilter: any;
  loading = false;
  pageIndex = 1;
  showEditor = false;
  documentEditorMode = 'create';
  documentBeingEdited: any;
  searchMode = 'simple';
  searchObj: simpleSearch = {
    key: '',
    value: '',
    type: 'String',
  };
  showAdvancedSearchForm = false;
  error: { status: boolean; desc: string } = { status: false, desc: '' };
  constructor(
    private API: ApiService,
    private message: NzMessageService,
    private notification: NzNotificationService
  ) {}

  editorOptions = {
    theme: 'vs',
    language: 'json',
    suggest: {
      showIcons: false,
    },
    contextmenu: false,
    codeLens: false,
    renderLineHighlight: 'none',
  };
  code: string = '{}';
  uploadButton = false;
  importError: any;
  file = '';
  rowData: any;
  importing = false;
  attributes = [];
  isVisible = false;
  ignore = false;
  ngOnInit() {
    this.query();
  }
  query() {
    // console.log(this.code, '#####');
    this.loading = true;
    this.API.filterDocumentsByQuery(
      this.database,
      this.collection,
      this.ejsonFilter || EJSON.serialize({}),
      this.pageIndex
    )
      .subscribe((documents: any) => {
        this.data = EJSON.deserialize(documents);
        if (this.searchMode === 'advanced') this.closeAdvancedSearchForm();
      })
      .add(() => {
        this.loading = false;
      });
  }
  getQuery() {
    if (this.searchMode === 'simple') {
      if (!this.searchObj.key) return '{}';
      let key = this.searchObj.key;
      let value = this.searchObj.value;
      if (this.searchObj.type === 'ObjectId' && ObjectId.isValid(value))
        value = { $oid: value };
      if (this.searchObj.type === 'Date') value = { $date: value };
      if (this.searchObj.type === 'Number') value = { $numberInt: value };
      if (this.searchObj.type === 'Boolean') {
        if (value === 'true') value = true;
        else {
          value = false;
          this.searchObj.value = 'false';
        }
      }
      return JSON.stringify({ [key]: value });
    } else return this.filter;
  }
  uiQuery() {
    this.pageIndex = 1;
    this.filter = this.getQuery();
    try {
      this.ejsonFilter = EJSON.serialize(JSON.parse(this.filter));
    } catch (err) {
      alert('Invalid query');
    }
    this.query();
  }

  clearFilter() {
    this.filter = '';
    this.ejsonFilter = EJSON.serialize({});
    this.searchObj = {
      key: '',
      value: '',
      type: 'String',
    };
    this.query();
  }

  deleteDocument(doc) {
    this.API.deleteDocumentById(
      this.database,
      this.collection,
      EJSON.serialize(_.pick(doc, '_id'))
    ).subscribe(() => {
      try {
        this.API.getDocumentCount(
          this.database,
          this.collection,
          this.filter ? JSON.parse(this.filter) : {}
        ).subscribe((res: any) => {
          this.message.info('Deleted!');
          this.data = EJSON.deserialize(res);
          if (this.pageIndex * 10 >= this.data.count)
            this.pageIndex = Math.ceil(this.data.count / 10);
          if (this.data.count === 0) this.pageIndex = 1;
          this.query();
        });
      } catch (err) {
        alert('Invalid JSON query!!');
        this.loading = false;
      }
    });
  }

  updateDocument() {
    try {
      this.error.status = false;
      this.error.desc = '';
      const originalDocument = EJSON.serialize(
        JSON.parse(this.documentBeingEdited)
      );
      // const method = this.documentEditorMode === 'create' ? this.API.createDocument : this.API.updateDocument
      this.API.createDocuments(
        this.database,
        this.collection,
        originalDocument
      ).subscribe((response) => {
        try {
          if (!response['nUpserted']) {
            this.closeEditor();
            this.message.success('Success!');
            this.query();
            return;
          }
          this.API.getDocumentCount(
            this.database,
            this.collection,
            this.filter ? JSON.parse(this.filter) : {}
          ).subscribe((res: any) => {
            this.closeEditor();
            this.message.success('Success!');
            this.data = EJSON.deserialize(res);
            this.pageIndex = Math.ceil(this.data.count / 10);
            this.query();
          });
        } catch (err) {
          alert('Invalid JSON query!!');
          this.loading = false;
        }
      });
    } catch (err) {
      this.error.status = true;
      this.error.desc = err;
    }
  }

  openEditor(doc, mode): void {
    this.documentEditorMode = mode || 'create';
    this.showEditor = true;
    this.documentBeingEdited = JSON.stringify(
      EJSON.serialize(doc),
      undefined,
      4
    );
  }

  closeEditor(): void {
    this.showEditor = false;
    this.documentBeingEdited = '';
  }
  openAdvancedSearchForm() {
    this.showAdvancedSearchForm = true;
  }
  closeAdvancedSearchForm() {
    this.showAdvancedSearchForm = false;
  }
  copyToClipboard(text: string) {
    text = JSON.stringify(text);
    const txtArea = document.createElement('textarea');
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = text;
    document.body.appendChild(txtArea);
    txtArea.select();
    try {
      const result = document.execCommand('copy');
      if (result) {
        this.message.success('Copied!');
      }
    } catch (err) {}
    document.body.removeChild(txtArea);
  }

  beforeUpload = (file: any): boolean => {
    this.importError = '';
    this.attributes = [];
    this.rowData = [];
    this.uploadButton = false;
    if (file.type !== 'text/csv' && file.type !== 'application/json') {
      this.message.error('You can only upload either JSON or CSV files!');
      this.importing = false;
      this.file = '';
      return false;
    }
    this.file = file.name;
    try {
      if (file.type === 'text/csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (!result.errors[0]) {
              const keys = _.take(_.keys(result.data[0]), 1500);
              this.attributes = _.map(keys, (key) => ({
                include: true,
                label: key,
                type: 'String',
              }));
              // for (let [index, attribute] of keys.entries()) {
              //   if (index >= 1500) break;
              //   this.attributes.push({
              //     include: true,
              //     label: attribute,
              //     type: 'String',
              //   });
              // };
              this.rowData = result.data;
              this.uploadButton = true;
            } else {
              this.importError = result.errors[0];
              this.rowData = [];
              this.uploadButton = false;
            }
          },
        });
      } else {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          this.rowData = reader.result;
          this.uploadButton = true;
        };
        reader.onerror = (e) => {
          this.importError = reader.error;
          this.rowData = [];
          this.uploadButton = false;
        };
      }
    } catch (err) {
      this.importError = err.message;
      this.rowData = [];
      this.uploadButton = false;
    }
    return false;
  };

  showModal(): void {
    this.isVisible = true;
    this.file = '';
    this.rowData = [];
    this.importError = '';
    this.uploadButton = false;
    this.importing = false;
  }

  importRecords(): void {
    let records: any = [];
    try {
      if (this.attributes[0]) {
        this.importError = '';
        this.importing = true;   
        this.uploadButton = false; 
        for (let row of this.rowData) {
          let record = {};
          for (let attribute of this.attributes) {
            if (attribute.include) {
              if (row[attribute.label]) {
                switch (attribute.type) {
                  case 'ObjectId':
                    row[attribute.label] = new ObjectId(row[attribute.label]);
                    break;

                  case 'Boolean':
                    row[attribute.label] = Boolean(row[attribute.label]);
                    break;

                  case 'Date':
                    row[attribute.label] = { $date: row[attribute.label] };
                    break;

                  case 'Number':
                    row[attribute.label] = {
                      $numberInt: row[attribute.label],
                    };
                    break;

                  default:
                    row[attribute.label] = String(row[attribute.label]);
                    break;
                }
                record[attribute.label] = row[attribute.label];
              }
            } 
          }
          if (this.importing) {
            records.push(record);
            this.importError = '';
          } else {
            records = [];
            break;
          }
        }
      } else {
        records = this.rowData;
        this.importError = '';
        this.importing = true;
        this.uploadButton = false;
      }
      if (!this.importError) {
        const originalDocument = EJSON.serialize(
          typeof records === 'string' ? JSON.parse(records) : records
        );
        this.API.createDocuments(
          this.database,
          this.collection,
          originalDocument
        ).subscribe((response) => {
          this.importing = false;
          this.uploadButton = false;
          if (!response['nUpserted']) {
            this.message.success('Success!');
            this.query();
            this.handleCancel();
            return;
          }
          this.API.getDocumentCount(
            this.database,
            this.collection,
            this.filter ? JSON.parse(this.filter) : {}
          ).subscribe((res: any) => {
            this.message.success('Success!');
            this.handleCancel();
            this.data = EJSON.deserialize(res);
            this.pageIndex = Math.ceil(this.data.count / 10);
            this.query();
          });
        });
      }
    } catch (err) {
      this.importError = err.message;
      this.uploadButton = true;
      this.importing = false;
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}
