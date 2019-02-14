export default class Labels {
  key: string;
  comparator: string;
  value: string;
 
  constructor(key, comparator, value) {
    this.key = key;
    this.comparator = comparator;
    this.value = value;
  }
}