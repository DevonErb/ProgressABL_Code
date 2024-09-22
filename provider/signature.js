const vscode = require('vscode');
const { StatementUtil } = require('../statement-util');
const { AblType, AblSchema } = require('@oe-zext/types');
const { AblSource } = require('@oe-zext/source');

export class Signature {
  static attach(context) {
    let instance = new Signature()
    instance.registerProviders(context)
  }

  constructor() {
    this.documentController = AblSource.Controller.getInstance()
  }

  registerProviders(context) {
    context.subscriptions.push(
      vscode.languages.registerSignatureHelpProvider(
        AblSchema.languageId,
        this,
        "("
      )
    )
  }

  provideSignatureHelp(document, position, token, context) {
    let doc = this.documentController.getDocument(document)
    if (doc) return this.analyseSignature(doc, position, token)
    return
  }

  analyseSignature(document, position, token) {
    let methodSignature = StatementUtil.nestedMethodName(
      document.document,
      position
    )
    if (!methodSignature) return
    let method = document.getMethod(methodSignature.name)
    if (method?.params?.length > 0) {
      let params = []
      let paramInfo = method.params?.map(param => {
        let doc = `${param.name}`
        if (param.dataType == AblType.ATTRIBUTE_TYPE.BUFFER) {
          doc = `buffer ${doc}: ${param.likeType}`
        } else if (param.dataType == AblType.ATTRIBUTE_TYPE.TEMP_TABLE) {
          doc = `table ${doc}`
        } else {
          if (param.dataType) {
            doc += `: ${param.dataType}`
          } else {
            doc += `: like ${param.likeType}`
          }
        }
        switch (param.direction) {
          case AblType.PARAM_DIRECTION.IN:
            doc = `input ${doc}`
            break
          case AblType.PARAM_DIRECTION.OUT:
            doc = `output ${doc}`
            break
          case AblType.PARAM_DIRECTION.INOUT:
            doc = `input-output ${doc}`
            break
          case AblType.PARAM_DIRECTION.RETURN:
            doc = `return ${doc}`
            break
        }
        params.push(doc)
        return new vscode.ParameterInformation(doc)
      })
      let result = new vscode.SignatureHelp()
      let signature = new vscode.SignatureInformation(method.name)
      signature.label += `(${params.join(", ")})`
      signature.parameters = paramInfo
      result.signatures = [signature]
      result.activeSignature = 0
      result.activeParameter = methodSignature.activeParameter
      return result
    }
    return
  }
}
