describe('exports', () => {
  it('should import correct from index', async () => {
    const modules = await import('@/index')
    expect(Object.keys(modules).sort()).toEqual(['BaseModel', 'ServiceModel', 'fields'].sort())
  })

  it('should import correct from fields', async () => {
    const modules = await import('@/fields')
    expect(Object.keys(modules).sort()).toEqual(['Field', 'FieldNotBoundException', 'CharField', 'default'].sort())
  })

  it('should import correct from models', async () => {
    const modules = await import('@/models')
    expect(Object.keys(modules).sort()).toEqual([
      'BaseModel', 'NotDeclaredFieldException', 'ServiceModel', 'MissingUrlException', 'ModelManager', 'default'
    ].sort())
  })

  it('should import correct from store', async () => {
    const modules = await import('@/store')
    expect(Object.keys(modules).sort()).toEqual(['ServiceStore'].sort())
  })
})
