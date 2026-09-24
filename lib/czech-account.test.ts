// lib/czech-account.test.ts
import { describe, it, expect } from 'vitest'
import { formatAccount, formatIban, parseCzechAccount, toIban } from './czech-account'

describe('parseCzechAccount', () => {
  it('parses an account with a prefix', () => {
    expect(parseCzechAccount('19-2000145399/0800')).toEqual({
      prefix: '19',
      number: '2000145399',
      bank: '0800',
    })
  })

  it('parses an account without a prefix and tolerates spaces', () => {
    expect(parseCzechAccount(' 2000145399 / 0800 ')).toEqual({ prefix: '', number: '2000145399', bank: '0800' })
  })

  it('drops leading zeros from both parts', () => {
    expect(parseCzechAccount('000019-2000145399/0800')?.prefix).toBe('19')
    expect(parseCzechAccount('178124-0000004159/0710')?.number).toBe('4159')
  })

  it('rejects a number that fails the mod-11 checksum', () => {
    expect(parseCzechAccount('123456789/0800')).toBeNull()
  })

  it('rejects a prefix that fails the checksum', () => {
    expect(parseCzechAccount('18-2000145399/0800')).toBeNull()
  })

  it('rejects a malformed bank code and garbage', () => {
    expect(parseCzechAccount('2000145399/800')).toBeNull()
    expect(parseCzechAccount('abc')).toBeNull()
    expect(parseCzechAccount('')).toBeNull()
    expect(parseCzechAccount('0000000000/0800')).toBeNull()
  })

  it('accepts a pasted IBAN with spaces', () => {
    expect(parseCzechAccount('CZ65 0800 0000 1920 0014 5399')).toEqual({
      prefix: '19',
      number: '2000145399',
      bank: '0800',
    })
  })

  it('rejects an IBAN with wrong check digits', () => {
    expect(parseCzechAccount('CZ6608000000192000145399')).toBeNull()
  })
})

describe('toIban', () => {
  it('matches the published Česká spořitelna and ČNB examples', () => {
    expect(toIban({ prefix: '19', number: '2000145399', bank: '0800' })).toBe('CZ6508000000192000145399')
    expect(toIban({ prefix: '178124', number: '4159', bank: '0710' })).toBe('CZ6907101781240000004159')
  })
})

describe('formatting', () => {
  it('writes the account the way Czech banks print it', () => {
    expect(formatAccount({ prefix: '19', number: '2000145399', bank: '0800' })).toBe('19-2000145399/0800')
    expect(formatAccount({ prefix: '', number: '2000145399', bank: '0800' })).toBe('2000145399/0800')
  })

  it('groups an IBAN by four', () => {
    expect(formatIban('CZ6508000000192000145399')).toBe('CZ65 0800 0000 1920 0014 5399')
  })
})
