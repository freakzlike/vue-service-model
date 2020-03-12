describe('exports', () => {
  const exceptionsExports = [
    'NotDeclaredFieldException', 'MissingUrlException', 'FieldNotBoundException', 'APIException',
    'BadRequestAPIException', 'UnauthorizedAPIException', 'ForbiddenAPIException', 'NotFoundAPIException',
    'InternalServerErrorAPIException'
  ]
  const fieldsExports = ['Field']
  const modelsExports = ['BaseModel', 'ServiceModel', 'ModelManager']
  const storeExports = ['ServiceStore']

  const checkExports = (modules: object, expectedExports: string[]) => {
    expect(Object.keys(modules).sort()).toEqual(expectedExports.sort())
  }

  it('should import correct from index', async () => {
    checkExports(await import('@/index'), [
      ...exceptionsExports,
      ...fieldsExports,
      ...modelsExports,
      ...storeExports
    ])
  })

  it('should import correct from exceptions', async () => {
    checkExports(await import('@/exceptions'), exceptionsExports)
  })

  it('should import correct from fields', async () => {
    checkExports(await import('@/fields'), fieldsExports)
  })

  it('should import correct from model', async () => {
    checkExports(await import('@/models'), modelsExports)
  })

  it('should import correct from store', async () => {
    checkExports(await import('@/store'), storeExports)
  })
})
